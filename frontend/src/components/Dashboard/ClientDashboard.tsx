import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { User, Appointment } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import { formatDateDisplay, formatTime, getRelativeTime } from '@/utils/dateUtils';
import { formatStatus } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';

interface ClientDashboardProps {
  user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const { appointments, isLoading } = useAppointments({
    status: 'all',
    limit: 10,
    page: 1,
  });

  const upcoming = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);

  const recent = appointments
    .filter((a) => ['completed', 'cancelled'].includes(a.status))
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          ¡Hola, {user.full_name.split(' ')[0]}! 👋
        </h1>
        <p className="text-primary-100 text-sm">
          {upcoming.length > 0
            ? `Tienes ${upcoming.length} cita${upcoming.length !== 1 ? 's' : ''} próxima${upcoming.length !== 1 ? 's' : ''}`
            : 'No tienes citas próximas. ¡Reserva una ahora!'}
        </p>
        <button
          onClick={() => setShowBookingForm(true)}
          className="mt-4 flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Próximas Citas</h2>
            <Link
              to="/appointments"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">Sin citas próximas</p>
              <button
                onClick={() => setShowBookingForm(true)}
                className="btn-primary text-sm py-2 px-4"
              >
                Reservar ahora
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <UpcomingCard key={apt.id} appointment={apt} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + stats */}
        <div className="space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total citas"
              value={appointments.length}
              icon={Calendar}
              color="primary"
            />
            <StatCard
              label="Completadas"
              value={appointments.filter((a) => a.status === 'completed').length}
              icon={CheckCircle}
              color="success"
            />
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Actividad Reciente</h2>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">Sin actividad reciente</p>
            ) : (
              <div className="space-y-2">
                {recent.map((apt) => (
                  <RecentItem key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Cita</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            <AppointmentForm
              onSuccess={() => setShowBookingForm(false)}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UpcomingCard({ appointment }: { appointment: Appointment }) {
  const status = formatStatus(appointment.status);
  const startDate = new Date(appointment.start_time);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {appointment.service?.name || 'Servicio'}
            </p>
            <span className={clsx('badge text-xs flex-shrink-0', status.bgColor, status.textColor)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateDisplay(startDate)}
            </span>
            <span>{formatTime(startDate)}</span>
          </div>
          {appointment.provider?.full_name && (
            <p className="text-xs text-gray-400 mt-0.5">
              con {appointment.provider.full_name}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 text-xs text-primary-600 font-medium">
        {getRelativeTime(startDate)}
      </div>
    </div>
  );
}

function RecentItem({ appointment }: { appointment: Appointment }) {
  const isCompleted = appointment.status === 'completed';
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
          isCompleted ? 'bg-success-100' : 'bg-error-50'
        )}
      >
        {isCompleted ? (
          <CheckCircle className="w-3.5 h-3.5 text-success-600" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-error-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">
          {appointment.service?.name || 'Servicio'}
        </p>
        <p className="text-xs text-gray-400">
          {formatDateDisplay(new Date(appointment.start_time))}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'primary' | 'success' | 'warning';
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mb-2', colorClasses[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
