import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import type { Appointment } from '@/types';
import { MONTHS_ES, DAYS_ES, toISODate, isToday } from '@/utils/dateUtils';
import { APPOINTMENT_STATUSES } from '@/utils/constants';

interface CalendarViewProps {
  appointments: Appointment[];
  currentDate: Date;
  selectedDate: Date | null;
  onDayClick: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarView({
  appointments,
  currentDate,
  selectedDate,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Map of date string → appointments
  const appointmentMap = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const dateStr = toISODate(new Date(apt.start_time));
      const existing = map.get(dateStr) || [];
      map.set(dateStr, [...existing, apt]);
    });
    return map;
  }, [appointments]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const days: (Date | null)[] = [];

    // Padding before first day
    for (let i = 0; i < startDow; i++) {
      days.push(null);
    }
    // Days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    // Padding after last day (fill to 6 rows)
    while (days.length < 42) {
      days.push(null);
    }
    return days;
  }, [year, month]);

  const selectedStr = selectedDate ? toISODate(selectedDate) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {MONTHS_ES[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={onPrevMonth}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS_ES.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-20 border-b border-r border-gray-50" />;
          }

          const dateStr = toISODate(date);
          const dayApts = appointmentMap.get(dateStr) || [];
          const todayFlag = isToday(date);
          const selectedFlag = selectedStr === dateStr;

          // Get status counts
          const statusCounts = dayApts.reduce<Record<string, number>>((acc, apt) => {
            acc[apt.status] = (acc[apt.status] || 0) + 1;
            return acc;
          }, {});

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(date)}
              className={clsx(
                'h-20 p-1.5 text-left border-b border-r border-gray-50 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-inset',
                selectedFlag && 'bg-primary-50 hover:bg-primary-50'
              )}
            >
              {/* Day number */}
              <span
                className={clsx(
                  'inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full transition-all',
                  todayFlag && !selectedFlag && 'bg-primary-500 text-white',
                  selectedFlag && 'bg-primary-600 text-white ring-2 ring-primary-300',
                  !todayFlag && !selectedFlag && 'text-gray-700 hover:bg-gray-200'
                )}
              >
                {date.getDate()}
              </span>

              {/* Appointment dots */}
              {dayApts.length > 0 && (
                <div className="mt-1 flex flex-col gap-0.5 overflow-hidden max-h-10">
                  {Object.entries(statusCounts)
                    .slice(0, 3)
                    .map(([status, count]) => {
                      const statusInfo = APPOINTMENT_STATUSES[status as keyof typeof APPOINTMENT_STATUSES];
                      return (
                        <div
                          key={status}
                          className={clsx(
                            'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium truncate',
                            statusInfo?.bgColor || 'bg-gray-100',
                            statusInfo?.textColor || 'text-gray-600'
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                          <span className="truncate">{count} {statusInfo?.label || status}</span>
                        </div>
                      );
                    })}
                  {dayApts.length > 3 && (
                    <span className="text-xs text-gray-400 pl-1">+{dayApts.length - 3} más</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-t border-gray-100">
        {Object.entries(APPOINTMENT_STATUSES).map(([status, info]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={clsx('w-2.5 h-2.5 rounded-full', info.bgColor)} />
            <span className="text-xs text-gray-500">{info.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
