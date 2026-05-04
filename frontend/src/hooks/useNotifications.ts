import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationService } from '@/services/notificationService';
import type { NotificationPreferences } from '@/types';
import { QUERY_KEYS } from '@/utils/constants';

export function useNotifications() {
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: [QUERY_KEYS.notifications],
    queryFn: notificationService.getPreferences,
  });

  const historyQuery = useQuery({
    queryKey: [QUERY_KEYS.notificationHistory],
    queryFn: notificationService.getHistory,
  });

  const updateMutation = useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.notifications] });
      toast.success('Preferencias actualizadas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar preferencias');
    },
  });

  return {
    preferences: preferencesQuery.data,
    isLoadingPreferences: preferencesQuery.isLoading,
    history: historyQuery.data ?? [],
    isLoadingHistory: historyQuery.isLoading,
    updatePreferences: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
