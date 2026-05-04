import axios from 'axios';
import type { Message, ChatMessage } from '@/types';
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

export interface SendMessageResponse {
  message: string;
  appointment_id?: string;
}

export const chatService = {
  async sendMessage(
    message: string,
    appointmentId?: string,
    history: ChatMessage[] = []
  ): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>('/chat', {
      message,
      appointment_id: appointmentId,
      history,
    });
    return response.data;
  },

  async getChatHistory(appointmentId: string): Promise<Message[]> {
    const response = await api.get<{ data: Message[] }>(`/chat/${appointmentId}`);
    return response.data.data;
  },
};
