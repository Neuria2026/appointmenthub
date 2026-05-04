import { useState, useCallback, useRef } from 'react';
import { chatService } from '@/services/chatService';
import { useChatStore } from '@/store/store';
import type { Message, ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const {
    messages,
    conversationHistory,
    isLoading,
    selectedAppointmentId,
    addMessage,
    addToHistory,
    setSelectedAppointment,
    clearHistory,
    setLoading,
  } = useChatStore();

  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
        appointment_id: selectedAppointmentId ?? undefined,
      };

      addMessage(userMessage);
      addToHistory({ role: 'user', content: content.trim() });
      setLoading(true);
      setError(null);

      try {
        abortRef.current = new AbortController();
        const response = await chatService.sendMessage(
          content.trim(),
          selectedAppointmentId ?? undefined,
          conversationHistory
        );

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: response.message,
          created_at: new Date().toISOString(),
          appointment_id: selectedAppointmentId ?? undefined,
        };

        addMessage(assistantMessage);
        addToHistory({ role: 'assistant', content: response.message });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al enviar el mensaje. Intenta de nuevo.';
        setError(message);
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Lo siento, ocurrió un error. Por favor, intenta de nuevo.',
          created_at: new Date().toISOString(),
        };
        addMessage(errorMessage);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [
      isLoading,
      selectedAppointmentId,
      conversationHistory,
      addMessage,
      addToHistory,
      setLoading,
    ]
  );

  const loadHistory = useCallback(
    async (appointmentId: string) => {
      setLoading(true);
      try {
        const history = await chatService.getChatHistory(appointmentId);
        // Convert to our Message format
        const msgs: Message[] = history.map((h) => ({
          ...h,
          role: h.role as 'user' | 'assistant',
        }));
        msgs.forEach((m) => addMessage(m));
        const chatHistory: ChatMessage[] = history.map((h) => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        }));
        chatHistory.forEach((h) => addToHistory(h));
      } catch {
        // Silently fail on history load
      } finally {
        setLoading(false);
      }
    },
    [addMessage, addToHistory, setLoading]
  );

  return {
    messages,
    conversationHistory,
    isLoading,
    error,
    selectedAppointmentId,
    sendMessage,
    loadHistory,
    setSelectedAppointment,
    clearHistory,
  };
}
