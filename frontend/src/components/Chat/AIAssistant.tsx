import { useEffect } from 'react';
import { Bot, Calendar, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { ChatInterface } from './ChatInterface';
import { useChat } from '@/hooks/useChat';
import type { Appointment } from '@/types';
import { formatDateDisplay, formatTime } from '@/utils/dateUtils';

interface AIAssistantProps {
  appointments?: Appointment[];
  initialAppointmentId?: string;
  className?: string;
}

export function AIAssistant({ appointments = [], initialAppointmentId, className }: AIAssistantProps) {
  const {
    messages,
    isLoading,
    error,
    selectedAppointmentId,
    sendMessage,
    setSelectedAppointment,
    clearHistory,
  } = useChat();

  // Set initial appointment context
  useEffect(() => {
    if (initialAppointmentId) {
      setSelectedAppointment(initialAppointmentId);
    }
  }, [initialAppointmentId, setSelectedAppointment]);

  const selectedAppointment = appointments.find((a) => a.id === selectedAppointmentId);

  return (
    <div className={clsx('flex flex-col h-full gap-4', className)}>
      {/* Context selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Asistente IA</h2>
            <p className="text-xs text-gray-400">Powered by Claude</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {appointments.length > 0 && (
            <div className="relative">
              <select
                value={selectedAppointmentId || ''}
                onChange={(e) => setSelectedAppointment(e.target.value || null)}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
              >
                <option value="">Sin contexto de cita</option>
                {appointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.service?.name} — {formatDateDisplay(new Date(apt.start_time))}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Selected appointment context badge */}
      {selectedAppointment && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-100 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
          <p className="text-xs text-primary-700">
            Contexto:{' '}
            <span className="font-semibold">{selectedAppointment.service?.name}</span>
            {' · '}
            {formatDateDisplay(new Date(selectedAppointment.start_time))} a las{' '}
            {formatTime(new Date(selectedAppointment.start_time))}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-2 bg-error-50 border border-error-200 rounded-xl text-xs text-error-600">
          {error}
        </div>
      )}

      {/* Chat interface */}
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        placeholder="Pregunta sobre tus citas, disponibilidad, o cualquier consulta..."
        className="flex-1 min-h-0"
      />

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {[
            '¿Cuándo es mi próxima cita?',
            '¿Qué servicios están disponibles?',
            'Quiero cancelar una cita',
            '¿Cómo reprogramo una cita?',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
