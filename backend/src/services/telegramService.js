import TelegramBot from 'node-telegram-bot-api';
import { env } from '../config/env.js';
import { format } from 'date-fns';
import es from 'date-fns/locale/es/index.js';

let bot = null;

function getBot() {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return null;
  }
  if (!bot) {
    bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
}

export const telegramService = {
  /**
   * Send a message to a Telegram chat
   */
  async sendTelegramMessage(chatId, message, options = {}) {
    const telegramBot = getBot();
    if (!telegramBot) {
      return { success: false, reason: 'not_configured' };
    }

    try {
      const result = await telegramBot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...options,
      });
      return { success: true, messageId: result.message_id };
    } catch (error) {
      console.error('Telegram send error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send appointment confirmation via Telegram
   */
  async sendAppointmentConfirmation(appointment) {
    const chatId = appointment.client?.telegram_id;
    if (!chatId) return { success: false, reason: 'no_telegram_id' };

    const startDate = new Date(appointment.start_time);
    const dateStr = format(startDate, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });

    const message = `✅ *Cita Confirmada*\n\n` +
      `Hola ${appointment.client?.full_name || 'Cliente'}, tu cita ha sido confirmada.\n\n` +
      `📋 *Servicio:* ${appointment.service?.name || 'N/A'}\n` +
      `📅 *Fecha:* ${dateStr}\n` +
      `👤 *Proveedor:* ${appointment.provider?.full_name || 'N/A'}\n\n` +
      `_AppointmentHub_`;

    return this.sendTelegramMessage(chatId, message);
  },

  /**
   * Send appointment reminder via Telegram
   */
  async sendAppointmentReminder(appointment, hoursAhead) {
    const chatId = appointment.client?.telegram_id;
    if (!chatId) return { success: false, reason: 'no_telegram_id' };

    const startDate = new Date(appointment.start_time);
    const timeStr = format(startDate, 'HH:mm');
    const dateStr = format(startDate, "EEEE, d 'de' MMMM", { locale: es });

    let timeLabel;
    if (hoursAhead >= 24) timeLabel = 'mañana';
    else if (hoursAhead >= 1) timeLabel = `en ${hoursAhead} hora${hoursAhead !== 1 ? 's' : ''}`;
    else timeLabel = 'en 15 minutos';

    const message = `⏰ *Recordatorio de Cita*\n\n` +
      `Hola, tienes una cita *${timeLabel}*.\n\n` +
      `📋 *Servicio:* ${appointment.service?.name || 'N/A'}\n` +
      `📅 *Fecha:* ${dateStr}\n` +
      `🕐 *Hora:* ${timeStr}\n` +
      `👤 *Con:* ${appointment.provider?.full_name || 'N/A'}`;

    return this.sendTelegramMessage(chatId, message);
  },

  /**
   * Setup Telegram bot commands (call once on startup)
   */
  setupBot() {
    const telegramBot = getBot();
    if (!telegramBot) {
      console.log('Telegram bot not configured (missing TELEGRAM_BOT_TOKEN)');
      return;
    }

    // Enable polling for receiving messages
    telegramBot.startPolling();

    telegramBot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      telegramBot.sendMessage(
        chatId,
        `👋 ¡Bienvenido a *AppointmentHub*!\n\n` +
        `Soy tu asistente de citas. Para recibir recordatorios, configura tu ID de Telegram en la plataforma: \`${chatId}\`\n\n` +
        `Comandos disponibles:\n` +
        `/start - Iniciar el bot\n` +
        `/help - Ayuda\n` +
        `/myid - Ver tu ID de Telegram`,
        { parse_mode: 'Markdown' }
      );
    });

    telegramBot.onText(/\/help/, (msg) => {
      telegramBot.sendMessage(
        msg.chat.id,
        `📚 *Ayuda - AppointmentHub Bot*\n\n` +
        `Para recibir recordatorios de tus citas:\n` +
        `1. Copia tu ID: \`${msg.chat.id}\`\n` +
        `2. Ve a AppointmentHub → Configuración → Notificaciones\n` +
        `3. Activa Telegram e ingresa tu ID\n\n` +
        `¡Listo! Recibirás recordatorios automáticos aquí.`,
        { parse_mode: 'Markdown' }
      );
    });

    telegramBot.onText(/\/myid/, (msg) => {
      telegramBot.sendMessage(
        msg.chat.id,
        `🆔 Tu ID de Telegram es: \`${msg.chat.id}\`\n\nCópialo y pégalo en AppointmentHub → Configuración → Notificaciones.`,
        { parse_mode: 'Markdown' }
      );
    });

    telegramBot.on('polling_error', (error) => {
      if (env.NODE_ENV === 'development') {
        console.error('Telegram polling error:', error.message);
      }
    });

    console.log('✅ Telegram bot started');
  },
};
