import type { NotificationPreferences, NotificationLog } from '@/types';
import { apiClient as api } from './apiClient';

export const notificationService = {
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<{ data: NotificationPreferences }>('/notifications/preferences');
    return response.data.data;
  },

  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await api.put<{ data: NotificationPreferences }>(
      '/notifications/preferences',
      preferences
    );
    return response.data.data;
  },

  async getHistory(): Promise<NotificationLog[]> {
    const response = await api.get<{ data: NotificationLog[] }>('/notifications/history');
    return response.data.data;
  },
};
