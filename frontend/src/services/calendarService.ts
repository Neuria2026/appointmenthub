import { apiClient as api } from './apiClient';

export interface CalendarSyncStatus {
  connected: boolean;
  last_sync?: string;
  email?: string;
}

export const calendarService = {
  async getAuthUrl(): Promise<string> {
    const response = await api.get<{ url: string }>('/calendar/auth-url');
    return response.data.url;
  },

  async getSyncStatus(): Promise<CalendarSyncStatus> {
    const response = await api.get<{ data: CalendarSyncStatus }>('/calendar/status');
    return response.data.data;
  },

  async disconnect(): Promise<void> {
    await api.delete('/calendar/disconnect');
  },

  async forceSync(): Promise<void> {
    await api.post('/calendar/sync');
  },
};
