import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Calendar, Clock, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { appointmentSchema, type AppointmentFormValues } from '@/utils/validators';
import { TimeSlotSelector } from '@/components/Calendar/TimeSlotSelector';
import { useAppointments, useAvailability } from '@/hooks/useAppointments';
import { appointmentService } from '@/services/appointmentService';
import type { TimeSlot } from '@/types';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { parseTimeOnDate } from '@/utils/dateUtils';
import { addMinutes } from 'date-fns';

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ServiceOption {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
}

export function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const { create, isCreating } = useAppointments();
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [servicesLoading, setServicesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedServiceId = watch('service_id');
  const selectedDate = watch('date');

  // Load services
  useEffect(() => {
    appointmentService
      .getServices()
      .then(setServices)
      .finally(() => setServicesLoading(false));
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Get availability
  const { data: availableSlots = [] } = useAvailability(
    selectedServiceId,
    selectedDate
  );

  const bookedSlots = availableSlots
    .filter((s) => !s.available)
    .map((s) => ({ start: s.start.toString(), end: s.end.toString() }));

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setValue('start_time', slot.time);
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    if (!selectedSlot || !selectedService) return;

    const dateObj = new Date(data.date + 'T00:00:00');
    const startTime = parseTimeOnDate(dateObj, data.start_time);
    const endTime = addMinutes(startTime, selectedService.duration_minutes);

    await create({
      service_id: data.service_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      notes: data.notes,
      status: 'pending',
    });
    onSuccess?.();
  };

  // Min date = today
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Service Selector */}
      <div>
        <label className="label-base flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          Servicio
        </label>
        {servicesLoading ? (
          <div className="input-base flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando servicios...
          </div>
        ) : (
          <select
            className={clsx(errors.service_id ? 'input-error' : 'input-base', 'cursor-pointer')}
            {...register('service_id')}
          >
            <option value="">Selecciona un servicio</option>
            {services.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name} — {formatDuration(svc.duration_minutes)} · {formatCurrency(svc.price)}
              </option>
            ))}
          </select>
        )}
        {errors.service_id && <p className="error-text">{errors.service_id.message}</p>}

        {/* Service details */}
        {selectedService && (
          <div className="mt-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
            <p className="text-sm font-medium text-primary-800">{selectedService.name}</p>
            {selectedService.description && (
              <p className="text-xs text-primary-600 mt-0.5">{selectedService.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-primary-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(selectedService.duration_minutes)}
              </span>
              <span>{formatCurrency(selectedService.price)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Date Picker */}
      <div>
        <label className="label-base flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          Fecha
        </label>
        <input
          type="date"
          min={minDate}
          className={errors.date ? 'input-error' : 'input-base'}
          {...register('date')}
        />
        {errors.date && <p className="error-text">{errors.date.message}</p>}
      </div>

      {/* Time Slot Selector */}
      {selectedServiceId && selectedDate && (
        <div>
          <TimeSlotSelector
            date={new Date(selectedDate + 'T00:00:00')}
            durationMinutes={selectedService?.duration_minutes || 60}
            bookedSlots={bookedSlots}
            selectedTime={selectedSlot?.time}
            onSelect={handleSlotSelect}
          />
          {errors.start_time && <p className="error-text">{errors.start_time.message}</p>}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="label-base">Notas (opcional)</label>
        <textarea
          rows={3}
          placeholder="Información adicional para el proveedor..."
          className="input-base resize-none"
          {...register('notes')}
        />
        {errors.notes && <p className="error-text">{errors.notes.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-2.5">
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isCreating || !selectedSlot}
          className={clsx('btn-primary flex items-center justify-center gap-2 py-2.5', onCancel ? 'flex-1' : 'w-full')}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando cita...
            </>
          ) : (
            'Reservar Cita'
          )}
        </button>
      </div>
    </form>
  );
}
