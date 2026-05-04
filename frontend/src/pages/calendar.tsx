import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { BottomNavigation } from '@/components/common/Navigation';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { GoogleCalendarSync } from '@/components/Calendar/GoogleCalendarSync';
import { useAppointments } from '@/hooks/useAppointments';
import { useCalendar } from '@/hooks/useCalendar';
import { formatDateDisplay, formatTime } from '@/utils/dateUtils';
import { formatStatus } from '@/utils/formatters';
import { clsx } from 'clsx';
import type { Appointment } from '@/types';

export default function CalendarPage() {
  const { appointments } = useAppointments({ status: 'all', limit: 100 });
  const {
    currentDate,
    selectedDate,
    selectedDateAppointments,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
  } = useCalendar(appointments);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex h-[calc(100vh-4rem)] sticky top-16">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="page-container pb-20 md:pb-8">
            <h1 className="section-title">Calendario</h1>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Calendar main */}
              <div className="xl:col-span-3">
                <CalendarView
                  appointments={appointments}
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  onDayClick={selectDate}
                  onPrevMonth={goToPreviousMonth}
                  onNextMonth={goToNextMonth}
                  onToday={goToToday}
                />

                {/* Selected day appointments */}
                {selectedDate && selectedDateAppointments.length > 0 && (
                  <div className="mt-4 card">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      {formatDateDisplay(selectedDate)} — {selectedDateAppointments.length} cita{selectedDateAppointments.length !== 1 ? 's' : ''}
                    </h3>
                    <div className="space-y-2">
                      {selectedDateAppointments.map((apt: Appointment) => {
                        const status = formatStatus(apt.status);
                        return (
                          <div key={apt.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                            <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', apt.status === 'confirmed' && 'bg-primary-500', apt.status === 'pending' && 'bg-amber-400', apt.status === 'completed' && 'bg-success-500', apt.status === 'cancelled' && 'bg-error-400')} />
                            <span className="text-sm font-medium text-gray-700 flex-1 truncate">{apt.service?.name || 'Servicio'}</span>
                            <span className="text-xs text-gray-400">{formatTime(apt.start_time)}</span>
                            <span className={clsx('badge text-xs', status.bgColor, status.textColor)}>{status.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1 space-y-4">
                <GoogleCalendarSync />

                {/* Upcoming */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Próximas citas</h3>
                  {appointments
                    .filter((a: Appointment) => ['pending', 'confirmed'].includes(a.status) && new Date(a.start_time) > new Date())
                    .sort((a: Appointment, b: Appointment) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .slice(0, 5)
                    .map((apt: Appointment) => (
                      <div key={apt.id} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-8 text-center">
                          <p className="text-xs font-bold text-primary-600">{formatTime(apt.start_time)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{apt.service?.name}</p>
                          <p className="text-xs text-gray-400">{formatDateDisplay(new Date(apt.start_time))}</p>
                        </div>
                      </div>
                    ))}
                  {appointments.filter((a: Appointment) => ['pending', 'confirmed'].includes(a.status) && new Date(a.start_time) > new Date()).length === 0 && (
                    <p className="text-xs text-gray-400 py-2">Sin próximas citas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
