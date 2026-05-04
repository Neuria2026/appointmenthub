import { useState } from 'react';
import { X, Calendar, Clock, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { Appointment, TimeSlot } from '@/types';
import { TimeSlotSelector } from '@/components/Calendar/TimeSlotSelector';
import { useAppointments } from '@/hooks/useAppointments';
import { formatDateTime } from '@/utils/dateUtils';
import { parseTimeOnDate } from '@/utils/dateUtils';
import { addMinutes } from 'date-fns';

interface RescheduleModalProps {
  appointment: Appointment;
  onSuccess?: () => void;
  onClose: () => void;
}

export function RescheduleModal({ appointment, onSuccess, onClose }: RescheduleModalProps) {
  const { update, isUpdating } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(
    new Date(appointment.start_time).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const minDate = new Date().toISOString().split('T')[0];
  const durationMinutes = appointment.service?.duration_minutes || 60;

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const startTime = parseTimeOnDate(dateObj, selectedSlot.time);
    const endTime = addMinutes(startTime, durationMinutes);

    await update({
      id: appointment.id,
      data: {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      },
    });
    onSuccess?.();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Reprogramar Cita</h2>
            <p className="text-sm text-gray-500">{appointment.service?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current time */}
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-5">
          <p className="text-xs font-medium text-amber-700 mb-1">Fecha y hora actual</p>
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Clock className="w-4 h-4" />
            {formatDateTime(new Date(appointment.start_time))}
          </div>
        </div>

        {/* New date */}
        <div className="mb-4">
          <label className="label-base flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Nueva fecha
          </label>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(null);
            }}
            className="input-base"
          />
        </div>

        {/* Time slots */}
        {selectedDate && (
          <TimeSlotSelector
            date={new Date(selectedDate + 'T00:00:00')}
            durationMinutes={durationMinutes}
            selectedTime={selectedSlot?.time}
            onSelect={setSelectedSlot}
            className="mb-5"
          />
        )}

        {/* Selected summary */}
        {selectedSlot && (
          <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl mb-5">
            <p className="text-xs font-medium text-primary-700 mb-1">Nueva fecha y hora</p>
            <p className="text-sm text-primary-800">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              a las {selectedSlot.time}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSlot || isUpdating}
            className={clsx(
              'btn-primary flex-1 flex items-center justify-center gap-2 py-2.5',
              (!selectedSlot || isUpdating) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reprogramando...
              </>
            ) : (
              'Confirmar Cambio'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
