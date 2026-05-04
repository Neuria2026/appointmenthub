import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

let anthropicClient = null;

function getClient() {
  if (!env.ANTHROPIC_API_KEY) {
    return null;
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

const SYSTEM_PROMPT = `Eres un asistente virtual inteligente de AppointmentHub, una plataforma de gestión de citas. Tu nombre es "Asistente AppointmentHub".

Tu rol es ayudar a los usuarios con:
- Información sobre sus citas (próximas, pasadas, detalles)
- Orientación sobre cómo reservar, cancelar o reprogramar citas
- Responder preguntas sobre los servicios disponibles
- Recomendaciones sobre los mejores horarios
- Soporte general sobre la plataforma

Reglas importantes:
1. Responde SIEMPRE en español
2. Sé amigable, profesional y conciso
3. Si no tienes información específica, orienta al usuario a la sección correcta de la plataforma
4. No inventes información sobre citas o servicios que no estén en el contexto
5. Mantén las respuestas cortas (máximo 200 palabras) a menos que se requiera más detalle
6. Usa emojis moderadamente para hacer la conversación más amigable
7. Si el usuario pide acciones (crear, cancelar citas), explica cómo hacerlo en la plataforma

Contexto de la plataforma: AppointmentHub permite a clientes reservar citas con proveedores de servicios profesionales. Los usuarios pueden gestionar citas, recibir recordatorios por WhatsApp/Telegram/Email, y usar este chat para obtener ayuda.`;

export const claudeService = {
  /**
   * Send a message to Claude and get a response
   */
  async callClaudeAPI(userMessage, appointmentContext, conversationHistory = []) {
    const client = getClient();

    if (!client) {
      return {
        message: 'El asistente de IA no está disponible en este momento. Por favor, contacta con soporte o gestiona tus citas directamente desde la plataforma.',
      };
    }

    try {
      // Build context string from appointment
      let contextStr = '';
      if (appointmentContext) {
        contextStr = `\n\nContexto de cita del usuario:
- Servicio: ${appointmentContext.service?.name || 'N/A'}
- Fecha y hora: ${appointmentContext.start_time ? new Date(appointmentContext.start_time).toLocaleString('es') : 'N/A'}
- Estado: ${appointmentContext.status || 'N/A'}
- Proveedor: ${appointmentContext.provider?.full_name || 'N/A'}
- Notas: ${appointmentContext.notes || 'Sin notas'}`;
      }

      // Build message history (limit to last 10 messages to control tokens)
      const messages = conversationHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT + contextStr,
        messages,
      });

      const assistantMessage = response.content[0]?.text || 'No pude procesar tu mensaje. Intenta de nuevo.';
      return { message: assistantMessage };
    } catch (error) {
      console.error('Claude API error:', error.message);

      if (error.status === 429) {
        return {
          message: 'El asistente está recibiendo muchas solicitudes. Por favor, intenta en unos segundos.',
        };
      }

      return {
        message: 'Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo o gestiona tus citas directamente desde la plataforma.',
      };
    }
  },
};
