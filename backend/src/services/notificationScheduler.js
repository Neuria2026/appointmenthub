import cron from 'node-cron';
import { query } from '../config/database.js';
import { whatsappService } from './whatsappService.js';
import { telegramService } from './telegramService.js';
import { emailService } from './emailService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Check appointments needing reminders and send them
 */
async function checkAndSendReminders() {
  try {
    const now = new Date();

    // Get appointments that need reminders (not yet sent)
    // Check for 15min, 1hour, and 1day reminders
    const reminderWindows = [
      { minutes: 15, label: '15min' },
      { minutes: 60, label: '1hour' },
      { minutes: 1440, label: '1day' },
    ];

    for (const window of reminderWindows) {
      const targetTime = new Date(now.getTime() + window.minutes * 60 * 1000);
      const targetTimeStart = new Date(targetTime.getTime() - 2.5 * 60 * 1000); // -2.5 min
      const targetTimeEnd = new Date(targetTime.getTime() + 2.5 * 60 * 1000); // +2.5 min

      const result = await query(
        `SELECT
           a.*,
           json_build_object('id', p.id, 'full_name', p.full_name, 'email', p.email, 'phone', p.phone) as provider,
           json_build_object('id', c.id, 'full_name', c.full_name, 'email', c.email, 'phone', c.phone, 'telegram_id', np.telegram_id) as client,
           json_build_object('id', s.id, 'name', s.name, 'duration_minutes', s.duration_minutes, 'price', s.price) as service,
           np.channels,
           np.reminder_times,
           np.phone_whatsapp,
           np.telegram_id
         FROM appointments a
         LEFT JOIN users p ON a.provider_id = p.id
         LEFT JOIN users c ON a.client_id = c.id
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN notification_preferences np ON np.user_id = a.client_id
         WHERE a.status IN ('pending', 'confirmed')
           AND a.start_time BETWEEN $1 AND $2
           AND NOT EXISTS (
             SELECT 1 FROM notification_log nl
             WHERE nl.appointment_id = a.id
               AND nl.type = $3
               AND nl.status = 'sent'
           )`,
        [targetTimeStart.toISOString(), targetTimeEnd.toISOString(), `reminder_${window.label}`]
      );

      for (const appointment of result.rows) {
        const channels = appointment.channels || ['email'];
        const reminderTimes = appointment.reminder_times || [60, 1440];

        // Check if this reminder time is in user's preferences
        if (!reminderTimes.includes(window.minutes)) continue;

        const hoursAhead = window.minutes / 60;

        // Send via each configured channel
        const sendPromises = [];

        if (channels.includes('whatsapp') && appointment.phone_whatsapp) {
          sendPromises.push(
            sendWithLog(
              appointment,
              'whatsapp',
              `reminder_${window.label}`,
              () => whatsappService.sendAppointmentReminder(appointment, hoursAhead)
            )
          );
        }

        if (channels.includes('telegram') && appointment.telegram_id) {
          sendPromises.push(
            sendWithLog(
              appointment,
              'telegram',
              `reminder_${window.label}`,
              () => telegramService.sendAppointmentReminder(appointment, hoursAhead)
            )
          );
        }

        if (channels.includes('email') && appointment.client?.email) {
          sendPromises.push(
            sendWithLog(
              appointment,
              'email',
              `reminder_${window.label}`,
              () => emailService.sendAppointmentReminder(appointment, appointment.client, hoursAhead)
            )
          );
        }

        await Promise.allSettled(sendPromises);
      }
    }
  } catch (error) {
    console.error('Notification scheduler error:', error.message);
  }
}

/**
 * Helper to send a notification and log it
 */
async function sendWithLog(appointment, channel, type, sendFn) {
  const logId = uuidv4();
  try {
    const result = await sendFn();
    await query(
      `INSERT INTO notification_log (id, user_id, appointment_id, channel, type, status, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [logId, appointment.client_id, appointment.id, channel, type, result.success ? 'sent' : 'failed']
    );
    return result;
  } catch (error) {
    await query(
      `INSERT INTO notification_log (id, user_id, appointment_id, channel, type, status, sent_at)
       VALUES ($1, $2, $3, $4, $5, 'failed', NOW())`,
      [logId, appointment.client_id, appointment.id, channel, type]
    ).catch(() => {}); // ignore log errors
    console.error(`Notification send error [${channel}/${type}]:`, error.message);
  }
}

/**
 * Start the notification scheduler
 */
export function startNotificationScheduler() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', checkAndSendReminders, {
    scheduled: true,
    timezone: 'America/Mexico_City',
  });

  console.log('✅ Notification scheduler started (every 5 minutes)');
}

/**
 * Immediately send a confirmation notification
 */
export async function sendConfirmationNotification(appointment) {
  const channels = appointment.channels || ['email'];

  if (channels.includes('whatsapp') && appointment.phone_whatsapp) {
    await sendWithLog(appointment, 'whatsapp', 'confirmation', () =>
      whatsappService.sendAppointmentConfirmation(appointment)
    );
  }

  if (channels.includes('telegram') && appointment.telegram_id) {
    await sendWithLog(appointment, 'telegram', 'confirmation', () =>
      telegramService.sendAppointmentConfirmation(appointment)
    );
  }

  if (channels.includes('email') && appointment.client?.email) {
    await sendWithLog(appointment, 'email', 'confirmation', () =>
      emailService.sendAppointmentConfirmation(appointment, appointment.client)
    );
  }
}
