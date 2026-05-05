import { apiClient as api } from './apiClient';

export interface ClientProvider {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string | null;
}

export interface ClientInfo {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ClientAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  service: { name: string; duration_minutes: number; price: number };
  provider: { full_name: string };
  staff: { name: string; specialty?: string } | null;
}

export const clientService = {
  async getMyProvider(): Promise<{ client: ClientInfo; provider: ClientProvider | null; app_name: string }> {
    const res = await api.get<{ data: { client: ClientInfo; provider: ClientProvider | null; app_name: string } }>('/public/my-provider');
    return res.data.data;
  },

  async getMyAppointments(): Promise<ClientAppointment[]> {
    const res = await api.get<{ data: ClientAppointment[] }>('/public/my-appointments');
    return res.data.data;
  },

  async setPassword(password: string): Promise<void> {
    await api.post('/public/set-password', { password });
  },
};
