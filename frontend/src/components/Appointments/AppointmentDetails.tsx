import { X, Calendar, Clock, User, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { Appointment } from '@/types';
import { formatDateTime, formatDuration as _formatDuration } from '@/utils/dateUtils';
import { formatStatus, formatCurrency, formatDuration } from '@/utils/formatters';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

export function AppointmentDetails({
  appointment,
  onClose,
  onReschedule,
  onCancel,
  onComplete,
}: AppointmentDetailsProps) {
  const status = formatStatus(appointment.status);
  const startDate = new Date(appointment.start_time);
  const endDate = new Date(appointment.end_time);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-w-md w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {appointment.service?.name || 'Detalles de la Cita'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={clsx(
                  'badge text-xs',
                  status.bgColor,
                  status.textColor
                )}
              >
                {status.label}
              </span>
              <span className="text-xs text-gray-400">ID: {appointment.id.slice(0, 8)}...</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{formatDateTime(startDate)}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {startDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {endDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  {appointment.service?.duration_minutes && (
                    <> · {formatDuration(appointment.service.duration_minutes)}</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-2 gap-3">
            {appointment.provider && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Proveedor</p>
                  <p className="text-sm font-medium text-gray-900">{appointment.provider.full_name}</p>
                  <p className="text-xs text-gray-500">{appointment.provider.email}</p>
                </div>
              </div>
            )}
            {appointment.client && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cliente</p>
                  <p className="text-sm font-medium text-gray-900">{appointment.client.full_name}</p>
                  <p className="text-xs text-gray-500">{appointment.client.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Service details */}
          {appointment.service && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Servicio</p>
                <p className="text-sm font-medium text-gray-900">{appointment.service.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDuration(appointment.service.duration_minutes)} ·{' '}
                  {formatCurrency(appointment.service.price)}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-xs font-medium text-amber-700">Notas</p>
              </div>
              <p className="text-sm text-amber-800">{appointment.notes}</p>
            </div>
          )}

          {/* Google Calendar */}
          {appointment.google_calendar_event_id && (
            <a
              href={`https://calendar.google.com/calendar/r/eventedit/${appointment.google_calendar_event_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver en Google Calendar
            </a>
          )}
        </div>

        {/* Review */}
        {appointment.review && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Reseña del cliente</p>
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={clsx('text-sm', i < appointment.review!.rating ? 'text-amber-400' : 'text-gray-200')}>
                  ★
                </span>
              ))}
            </div>
            {appointment.review.comment && (
              <p className="text-sm text-gray-600">{appointment.review.comment}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
          {onReschedule && ['pending', 'confirmed'].includes(appointment.status) && (
            <button onClick={onReschedule} className="btn-outline text-sm py-2 flex-1">
              Reprogramar
            </button>
          )}
          {onComplete && appointment.status === 'confirmed' && (
            <button
              onClick={onComplete}
              className="flex-1 py-2 px-4 bg-success-500 hover:bg-success-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Completar
            </button>
          )}
          {onCancel && ['pending', 'confirmed'].includes(appointment.status) && (
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-error-50 hover:bg-error-100 text-error-600 text-sm font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          )}
          <button onClick={onClose} className="btn-ghost text-sm py-2 flex-1">
            Cerrar
          </button>
        </div>

        {/* Timestamps */}
        <div className="mt-3 flex gap-4 text-xs text-gray-300">
          <span>Creada: {new Date(appointment.created_at).toLocaleDateString('es')}</span>
          {appointment.updated_at !== appointment.created_at && (
            <span>Modificada: {new Date(appointment.updated_at).toLocaleDateString('es')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
