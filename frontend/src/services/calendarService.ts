import axios from 'axios';
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
