import twilio from 'twilio';
import { env } from '../config/env.js';
import { format } from 'date-fns';
import es from 'date-fns/locale/es/index.js';

let client = null;

function getClient() {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.warn('WhatsApp not configured (missing Twilio credentials)');
    return null;
  }
  if (!client) {
    client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

export const whatsappService = {
  /**
   * Send a WhatsApp message
   */
  async sendWhatsAppMessage(to, message) {
    const twilioClient = getClient();
    if (!twilioClient) return { success: false, reason: 'not_configured' };

    try {
      const normalizedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const result = await twilioClient.messages.create({
        from: env.TWILIO_WHATSAPP_NUMBER,
        to: normalizedTo,
        body: message,
      });
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('WhatsApp send error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send appointment confirmation via WhatsApp
   */
  async sendAppointmentConfirmation(appointment) {
    const phone = appointment.client?.phone;
    if (!phone) return { success: false, reason: 'no_phone' };

    const startDate = new Date(appointment.start_time);
    const dateStr = format(startDate, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });

    const message = `✅ *Cita Confirmada - ${env.APP_NAME}*

Hola ${appointment.client?.full_name || 'Cliente'}, tu cita ha sido confirmada.

📋 *Servicio:* ${appointment.service?.name || 'N/A'}
📅 *Fecha:* ${dateStr}
👤 *Proveedor:* ${appointment.provider?.full_name || 'N/A'}

Si necesitas cambiar o cancelar tu cita, hazlo con al menos 24 horas de anticipación.

_${env.APP_NAME}_`;

    return this.sendWhatsAppMessage(phone, message);
  },

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(appointment, hoursAhead) {
    const phone = appointment.client?.phone;
    if (!phone) return { success: false, reason: 'no_phone' };

    const startDate = new Date(appointment.start_time);
    const timeStr = format(startDate, 'HH:mm');
    const dateStr = format(startDate, "EEEE, d 'de' MMMM", { locale: es });

    let timeLabel;
    if (hoursAhead >= 24) timeLabel = 'mañana';
    else if (hoursAhead >= 1) timeLabel = `en ${hoursAhead} hora${hoursAhead !== 1 ? 's' : ''}`;
    else timeLabel = 'en 15 minutos';

    const message = `⏰ *Recordatorio de Cita - ${env.APP_NAME}*

Hola ${appointment.client?.full_name || 'Cliente'}, te recordamos que tienes una cita *${timeLabel}*.

📋 *Servicio:* ${appointment.service?.name || 'N/A'}
📅 *Fecha:* ${dateStr}
🕐 *Hora:* ${timeStr}
👤 *Con:* ${appointment.provider?.full_name || 'N/A'}

¡No olvides asistir! Si no puedes ir, cancela a tiempo.`;

    return this.sendWhatsAppMessage(phone, message);
  },

  /**
   * Send reschedule notification
   */
  async sendRescheduleNotification(appointment, previousTime) {
    const phone = appointment.client?.phone;
    if (!phone) return { success: false, reason: 'no_phone' };

    const newDate = new Date(appointment.start_time);
    const newDateStr = format(newDate, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es });
    const oldDate = new Date(previousTime);
    const oldDateStr = format(oldDate, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es });

    const message = `📅 *Cita Reprogramada - ${env.APP_NAME}*

Hola ${appointment.client?.full_name || 'Cliente'}, tu cita ha sido reprogramada.

📋 *Servicio:* ${appointment.service?.name || 'N/A'}
❌ *Fecha anterior:* ${oldDateStr}
✅ *Nueva fecha:* ${newDateStr}

_${env.APP_NAME}_`;

    return this.sendWhatsAppMessage(phone, message);
  },
};
