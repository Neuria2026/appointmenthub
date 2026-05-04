import { useMemo } from 'react';
import { clsx } from 'clsx';
import { Clock } from 'lucide-react';
import type { TimeSlot } from '@/types';
import { getTimeSlots } from '@/utils/dateUtils';

interface TimeSlotSelectorProps {
  date: Date;
  durationMinutes?: number;
  bookedSlots?: Array<{ start: string; end: string }>;
  selectedTime?: string;
  onSelect: (slot: TimeSlot) => void;
  className?: string;
}

export function TimeSlotSelector({
  date,
  durationMinutes = 60,
  bookedSlots = [],
  selectedTime,
  onSelect,
  className,
}: TimeSlotSelectorProps) {
  const slots = useMemo(
    () => getTimeSlots(date, durationMinutes, bookedSlots),
    [date, durationMinutes, bookedSlots]
  );

  const availableCount = slots.filter((s) => s.available).length;

  if (slots.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No hay horarios disponibles para esta fecha</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-gray-700">Selecciona un horario</span>
        </div>
        <span className="text-xs text-gray-400">
          {availableCount} {availableCount === 1 ? 'disponible' : 'disponibles'}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isBooked = !slot.available;

          return (
            <button
              key={slot.time}
              type="button"
              disabled={isBooked}
              onClick={() => onSelect(slot)}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
                isBooked && 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed',
                !isBooked && !isSelected &&
                  'bg-white border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700',
                isSelected &&
                  'bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-200'
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-gray-200 bg-white" />
          <span className="text-xs text-gray-400">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary-500" />
          <span className="text-xs text-gray-400">Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100" />
          <span className="text-xs text-gray-400">Ocupado</span>
        </div>
      </div>
    </div>
  );
}
