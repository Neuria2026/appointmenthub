import sgMail from '@sendgrid/mail';
import { env } from '../config/env.js';
import { format } from 'date-fns';
import es from 'date-fns/locale/es/index.js';

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

function isConfigured() {
  return Boolean(env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL);
}

async function sendEmail({ to, subject, html, text }) {
  if (!isConfigured()) {
    console.log(`[Email] (not configured) To: ${to} — Subject: ${subject}`);
    return { success: false, reason: 'not_configured' };
  }

  try {
    await sgMail.send({
      to,
      from: {
        email: env.SENDGRID_FROM_EMAIL,
        name: 'AppointmentHub',
      },
      subject,
      html,
      text: text || subject,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
}

const baseHtml = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AppointmentHub</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 24px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); padding: 32px 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">📅 AppointmentHub</h1>
    </div>
    <!-- Content -->
    <div style="padding: 40px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} AppointmentHub ·
        <a href="${env.FRONTEND_URL}" style="color: #6366f1;">Visitar plataforma</a>
      </p>
    </div>
  </div>
</body>
</html>`;

export const emailService = {
  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(appointment, client) {
    const to = client?.email || appointment.client?.email;
    if (!to) return { success: false, reason: 'no_email' };

    const startDate = new Date(appointment.start_time);
    const dateStr = format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const timeStr = format(startDate, 'HH:mm');
    const endTimeStr = format(new Date(appointment.end_time), 'HH:mm');
    const name = client?.full_name || appointment.client?.full_name || 'Cliente';

    const content = `
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0;">
        ✅ Cita Confirmada
      </h2>
      <p style="color: #6b7280; margin-bottom: 24px;">Hola <strong>${name}</strong>, tu cita ha sido confirmada exitosamente.</p>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">📋 Servicio</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${appointment.service?.name || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📅 Fecha</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-transform: capitalize;">${dateStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🕐 Hora</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${timeStr} – ${endTimeStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">👤 Proveedor</td><td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${appointment.provider?.full_name || 'N/A'}</td></tr>
        </table>
      </div>

      <a href="${env.FRONTEND_URL}/appointments" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Ver mis citas
      </a>`;

    return sendEmail({
      to,
      subject: `✅ Cita confirmada - ${appointment.service?.name || 'AppointmentHub'}`,
      html: baseHtml(content),
    });
  },

  /**
   * Send reminder email
   */
  async sendAppointmentReminder(appointment, client, hoursAhead) {
    const to = client?.email || appointment.client?.email;
    if (!to) return { success: false, reason: 'no_email' };

    const startDate = new Date(appointment.start_time);
    const timeStr = format(startDate, 'HH:mm');
    const dateStr = format(startDate, "EEEE, d 'de' MMMM", { locale: es });

    let timeLabel;
    if (hoursAhead >= 24) timeLabel = 'mañana';
    else if (hoursAhead >= 1) timeLabel = `en ${hoursAhead} hora${hoursAhead !== 1 ? 's' : ''}`;
    else timeLabel = 'en 15 minutos';

    const name = client?.full_name || appointment.client?.full_name || 'Cliente';

    const content = `
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0;">
        ⏰ Recordatorio: Cita ${timeLabel}
      </h2>
      <p style="color: #6b7280; margin-bottom: 24px;">Hola <strong>${name}</strong>, te recordamos que tienes una cita próximamente.</p>

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px; font-weight: 700; color: #92400e; font-size: 16px;">📋 ${appointment.service?.name || 'Cita'}</p>
        <p style="margin: 0 0 6px; color: #78350f; font-size: 14px;">📅 ${dateStr} a las ${timeStr}</p>
        <p style="margin: 0; color: #78350f; font-size: 14px;">👤 Con ${appointment.provider?.full_name || 'N/A'}</p>
      </div>`;

    return sendEmail({
      to,
      subject: `⏰ Recordatorio: Cita ${timeLabel} - ${appointment.service?.name}`,
      html: baseHtml(content),
    });
  },

  /**
   * Send feedback request after completed appointment
   */
  async sendFeedbackRequest(appointment, client) {
    const to = client?.email || appointment.client?.email;
    if (!to) return { success: false, reason: 'no_email' };

    const name = client?.full_name || appointment.client?.full_name || 'Cliente';
    const reviewUrl = `${env.FRONTEND_URL}/appointments?review=${appointment.id}`;

    const content = `
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0;">
        ⭐ ¿Cómo fue tu experiencia?
      </h2>
      <p style="color: #6b7280; margin-bottom: 24px;">Hola <strong>${name}</strong>, tu cita de <strong>${appointment.service?.name || 'N/A'}</strong> ha finalizado. Tu opinión nos ayuda a mejorar.</p>

      <a href="${reviewUrl}" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        ⭐ Dejar Reseña
      </a>`;

    return sendEmail({
      to,
      subject: `⭐ Cuéntanos tu experiencia - ${appointment.service?.name}`,
      html: baseHtml(content),
    });
  },
};
