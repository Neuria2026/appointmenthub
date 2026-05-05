import type { Service, ServiceFormData, Staff, StaffFormData } from '@/types';
import { apiClient as api } from './apiClient';

// ── Services ────────────────────────────────────────────────

export const serviceApi = {
  async list(providerId: string): Promise<Service[]> {
    const res = await api.get<{ data: Service[] }>(`/users/${providerId}/services`);
    return res.data.data;
  },

  async create(data: ServiceFormData): Promise<Service> {
    const res = await api.post<{ data: Service }>('/services', data);
    return res.data.data;
  },

  async update(serviceId: string, data: Partial<ServiceFormData & { is_active: boolean }>): Promise<Service> {
    const res = await api.put<{ data: Service }>(`/services/${serviceId}`, data);
    return res.data.data;
  },

  async remove(serviceId: string): Promise<void> {
    await api.delete(`/services/${serviceId}`);
  },

  async setStaff(serviceId: string, staffIds: string[]): Promise<void> {
    await api.put(`/staff/services/${serviceId}`, { staff_ids: staffIds });
  },
};

// ── Staff ────────────────────────────────────────────────────

export const staffApi = {
  async list(): Promise<Staff[]> {
    const res = await api.get<{ data: Staff[] }>('/staff');
    return res.data.data;
  },

  async create(data: StaffFormData): Promise<Staff> {
    const res = await api.post<{ data: Staff }>('/staff', data);
    return res.data.data;
  },

  async update(staffId: string, data: Partial<StaffFormData & { is_active: boolean }>): Promise<Staff> {
    const res = await api.put<{ data: Staff }>(`/staff/${staffId}`, data);
    return res.data.data;
  },

  async remove(staffId: string): Promise<void> {
    await api.delete(`/staff/${staffId}`);
  },
};

// ── Logo ─────────────────────────────────────────────────────

export async function uploadLogo(userId: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.put<{ data: { logo_url: string } }>(`/users/${userId}`, {
          logo_url: base64,
        });
        resolve(res.data.data.logo_url);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
