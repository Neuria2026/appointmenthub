import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

const api = axios.create({ baseURL: `${API_BASE_URL}/api/public` });

export interface PublicService {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
  staff: { id: string; name: string; specialty?: string }[];
}

export interface PublicSlot {
  time: string;
  start: string;
  end: string;
  available: boolean;
}

export interface BusinessInfo {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  app_name: string;
}

export interface BookingPayload {
  service_id: string;
  staff_id?: string | null;
  start_time: string;
  end_time: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  notes?: string;
}

export interface BookingResult {
  appointment_id: string;
  service: { name: string; duration_minutes: number; price: number };
  staff: { name: string; specialty?: string } | null;
  start_time: string;
  end_time: string;
  client_name: string;
  client_email: string;
}

export const bookingService = {
  async getInfo(providerId?: string): Promise<BusinessInfo> {
    const params = providerId ? { p: providerId } : {};
    const res = await api.get<{ data: BusinessInfo }>('/info', { params });
    return res.data.data;
  },

  async getServices(providerId?: string): Promise<PublicService[]> {
    const params = providerId ? { p: providerId } : {};
    const res = await api.get<{ data: PublicService[] }>('/services', { params });
    return res.data.data;
  },

  async getAvailability(serviceId: string, date: string, staffId?: string | null): Promise<PublicSlot[]> {
    const params: Record<string, string> = { service_id: serviceId, date };
    if (staffId) params.staff_id = staffId;
    const res = await api.get<{ data: PublicSlot[] }>('/availability', { params });
    return res.data.data;
  },

  async book(payload: BookingPayload): Promise<BookingResult> {
    const res = await api.post<{ data: BookingResult }>('/book', payload);
    return res.data.data;
  },
};
