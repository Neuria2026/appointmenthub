import axios from 'axios';
import type { NotificationPreferences, NotificationLog } from '@/types';
import { API_BASE_URL, TOKEN_KEY } from '@/utils/constants';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
