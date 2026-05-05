import type { Message, ChatMessage } from '@/types';
import { apiClient as api } from './apiClient';

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
