import { useState } from 'react';
import { CalendarDays, RefreshCw, Unlink, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { calendarService } from '@/services/calendarService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '@/utils/dateUtils';

export function GoogleCalendarSync() {
  const queryClient = useQueryClient();
  const [autoSync, setAutoSync] = useState(true);

  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ['calendar-sync-status'],
    queryFn: calendarService.getSyncStatus,
  });

  const connectMutation = useMutation({
    mutationFn: calendarService.getAuthUrl,
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error('Error al conectar Google Calendar');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: calendarService.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync-status'] });
      toast.success('Google Calendar desconectado');
    },
  });

  const forceSyncMutation = useMutation({
    mutationFn: calendarService.forceSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync-status'] });
      toast.success('Sincronización completada');
    },
    onError: () => {
      toast.error('Error al sincronizar');
    },
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const isConnected = syncStatus?.connected;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Google Calendar</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-success-500' : 'bg-gray-300'
                )}
              />
              <span className={clsx('text-xs', isConnected ? 'text-success-600' : 'text-gray-400')}>
                {isConnected ? 'Sincronizado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          {/* Connected email */}
          {syncStatus?.email && (
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">{syncStatus.email}</span>
            </div>
          )}

          {/* Last sync */}
          {syncStatus?.last_sync && (
            <p className="text-xs text-gray-400">
              Última sincronización: {formatDateTime(syncStatus.last_sync)}
            </p>
          )}

          {/* Auto sync toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Sincronización automática</p>
              <p className="text-xs text-gray-400">Sincroniza cada vez que hay cambios</p>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={clsx(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                autoSync ? 'bg-primary-500' : 'bg-gray-200'
              )}
            >
              <span
                className={clsx(
                  'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                  autoSync ? 'translate-x-4.5' : 'translate-x-0.5'
                )}
                style={{ transform: autoSync ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => forceSyncMutation.mutate()}
              disabled={forceSyncMutation.isPending}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {forceSyncMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Sincronizar ahora
            </button>
            <span className="text-gray-200">|</span>
            <button
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="flex items-center gap-1.5 text-xs text-error-500 hover:text-error-600 font-medium transition-colors"
            >
              <Unlink className="w-3.5 h-3.5" />
              Desconectar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Conecta tu Google Calendar para sincronizar automáticamente todas tus citas.
          </p>
          <button
            onClick={() => connectMutation.mutate()}
            disabled={connectMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow"
          >
            {connectMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Conectar Google Calendar
          </button>
        </div>
      )}
    </div>
  );
}
