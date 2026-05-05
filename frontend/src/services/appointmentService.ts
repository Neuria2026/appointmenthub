import type { Appointment, AppointmentFilters, PaginatedResponse, TimeSlot } from '@/types';
import { apiClient as api } from './apiClient';

export const appointmentService = {
  async getAppointments(filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<PaginatedResponse<Appointment>>(
      `/appointments?${params.toString()}`
    );
    return response.data;
  },

  async getAppointment(id: string): Promise<Appointment> {
    const response = await api.get<{ data: Appointment }>(`/appointments/${id}`);
    return response.data.data;
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const response = await api.post<{ data: Appointment }>('/appointments', data);
    return response.data.data;
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const response = await api.put<{ data: Appointment }>(`/appointments/${id}`, data);
    return response.data.data;
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  async completeAppointment(id: string): Promise<Appointment> {
    const response = await api.post<{ data: Appointment }>(`/appointments/${id}/complete`);
    return response.data.data;
  },

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    const response = await api.put<{ data: Appointment }>(`/appointments/${id}`, {
      status: 'cancelled',
      cancellation_reason: reason,
    });
    return response.data.data;
  },

  async getAvailability(serviceId: string, date: string): Promise<TimeSlot[]> {
    const response = await api.get<{ data: TimeSlot[] }>(
      `/appointments/availability?service_id=${serviceId}&date=${date}`
    );
    return response.data.data;
  },

  async getServices(providerId?: string): Promise<{ id: string; name: string; duration_minutes: number; price: number; description?: string }[]> {
    const url = providerId ? `/users/${providerId}/services` : '/services';
    const response = await api.get<{ data: { id: string; name: string; duration_minutes: number; price: number; description?: string }[] }>(url);
    return response.data.data;
  },

  async createService(data: {
    name: string;
    duration_minutes: number;
    price: number;
    description?: string;
  }): Promise<{ id: string; name: string }> {
    const response = await api.post('/services', data);
    return response.data.data;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
