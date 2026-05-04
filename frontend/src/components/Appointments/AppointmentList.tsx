import { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  Edit2,
  X,
  CheckCircle,
  RotateCcw,
  Filter,
  Search,
  ChevronLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Appointment, AppointmentStatus } from '@/types';
import { formatDateDisplay, formatTime } from '@/utils/dateUtils';
import { formatStatus, formatDuration } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onStatusFilter?: (status: AppointmentStatus | 'all') => void;
  onView?: (appointment: Appointment) => void;
  onEdit?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  showActions?: boolean;
}

const STATUS_FILTERS: Array<{ value: AppointmentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

const PAGE_SIZE = 10;

export function AppointmentList({
  appointments,
  isLoading,
  total = 0,
  page = 1,
  onPageChange,
  onStatusFilter,
  onView,
  onEdit,
  onReschedule,
  onCancel,
  onComplete,
  showActions = true,
}: AppointmentListProps) {
  const [activeFilter, setActiveFilter] = useState<AppointmentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (status: AppointmentStatus | 'all') => {
    setActiveFilter(status);
    onStatusFilter?.(status);
  };

  const filtered = appointments.filter((apt) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      apt.service?.name?.toLowerCase().includes(q) ||
      apt.provider?.full_name?.toLowerCase().includes(q) ||
      apt.client?.full_name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" label="Cargando citas..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                activeFilter === value
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar citas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 text-sm"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">Sin citas</h3>
          <p className="text-sm text-gray-400">
            {searchQuery
              ? 'No hay resultados para tu búsqueda'
              : 'No hay citas con el filtro seleccionado'}
          </p>
        </div>
      )}

      {/* Appointment Cards */}
      <div className="space-y-3">
        {filtered.map((apt) => {
          const status = formatStatus(apt.status);
          const startDate = new Date(apt.start_time);

          return (
            <div
              key={apt.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div
                    className={clsx(
                      'w-1 h-full min-h-[40px] rounded-full flex-shrink-0 self-stretch',
                      apt.status === 'confirmed' && 'bg-primary-400',
                      apt.status === 'pending' && 'bg-amber-400',
                      apt.status === 'completed' && 'bg-success-400',
                      apt.status === 'cancelled' && 'bg-error-400'
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {apt.service?.name || 'Servicio'}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {apt.provider?.full_name || apt.client?.full_name || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          'flex-shrink-0 badge text-xs',
                          status.bgColor,
                          status.textColor
                        )}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateDisplay(startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(startDate)}
                      </span>
                      {apt.service?.duration_minutes && (
                        <span>{formatDuration(apt.service.duration_minutes)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onView && (
                        <button
                          onClick={() => onView(apt)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && apt.status === 'pending' && (
                        <button
                          onClick={() => onEdit(apt)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onReschedule && ['pending', 'confirmed'].includes(apt.status) && (
                        <button
                          onClick={() => onReschedule(apt)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Reprogramar"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      {onComplete && apt.status === 'confirmed' && (
                        <button
                          onClick={() => onComplete(apt)}
                          className="p-1.5 text-gray-400 hover:text-success-600 hover:bg-success-100 rounded-lg transition-all"
                          title="Completar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {onCancel && ['pending', 'confirmed'].includes(apt.status) && (
                        <button
                          onClick={() => onCancel(apt)}
                          className="p-1.5 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-400">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
