import { useState } from 'react';
import { Bell, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { NotificationLog, NotificationChannel } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDateTime } from '@/utils/dateUtils';
import { NOTIFICATION_CHANNELS } from '@/utils/constants';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function NotificationHistory() {
  const { history, isLoadingHistory } = useNotifications();
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');

  const filtered = history.filter((log) => {
    if (channelFilter !== 'all' && log.channel !== channelFilter) return false;
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    return true;
  });

  const statusConfig = {
    sent: { label: 'Enviado', icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-100' },
    failed: { label: 'Fallido', icon: XCircle, color: 'text-error-600', bg: 'bg-error-50' },
    pending: { label: 'Pendiente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  };

  const typeLabels: Record<string, string> = {
    confirmation: 'Confirmación',
    reminder: 'Recordatorio',
    reschedule: 'Reprogramación',
    cancellation: 'Cancelación',
    feedback: 'Solicitud de feedback',
  };

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" label="Cargando historial..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as NotificationChannel | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="all">Todos los canales</option>
            {(Object.keys(NOTIFICATION_CHANNELS) as NotificationChannel[]).map((ch) => (
              <option key={ch} value={ch}>
                {NOTIFICATION_CHANNELS[ch].label}
              </option>
            ))}
          </select>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="all">Todos los estados</option>
          <option value="sent">Enviados</option>
          <option value="failed">Fallidos</option>
          <option value="pending">Pendientes</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">No hay notificaciones en el historial</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Fecha
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Tipo
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Canal
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log: NotificationLog) => {
                const status = statusConfig[log.status];
                const StatusIcon = status.icon;

                return (
                  <tr key={log.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDateTime(log.sent_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">
                      {typeLabels[log.type] || log.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600">
                        {NOTIFICATION_CHANNELS[log.channel]?.label || log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          status.bg,
                          status.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
