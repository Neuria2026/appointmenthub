import { google } from 'googleapis';
import { env } from '../config/env.js';
import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

export const googleCalendarService = {
  /**
   * Get OAuth2 authorization URL
   */
  getAuthUrl(userId) {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId,
      prompt: 'consent',
    });
  },

  /**
   * Handle OAuth2 callback and store tokens
   */
  async handleCallback(code, userId) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError('Google Calendar no está configurado', 503);
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profile = await oauth2.userinfo.get();

    // Store tokens in user record
    await query(
      `UPDATE users SET google_calendar_tokens = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(tokens), userId]
    );

    return { email: profile.data.email, tokens };
  },

  /**
   * Get authenticated client for a user
   */
  async getAuthenticatedClient(userId) {
    const result = await query(
      'SELECT google_calendar_tokens FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows[0]?.google_calendar_tokens) {
      throw new AppError('Google Calendar no está conectado', 400, 'GoogleCalendarNotConnected');
    }

    const tokens = result.rows[0].google_calendar_tokens;
    const client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
    client.setCredentials(tokens);

    // Handle token refresh
    client.on('tokens', async (newTokens) => {
      const updatedTokens = { ...tokens, ...newTokens };
      await query(
        'UPDATE users SET google_calendar_tokens = $1 WHERE id = $2',
        [JSON.stringify(updatedTokens), userId]
      );
    });

    return client;
  },

  /**
   * Create a Google Calendar event for an appointment
   */
  async createEvent(userId, appointment) {
    try {
      const authClient = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      const event = {
        summary: `${appointment.service?.name || 'Cita'} - AppointmentHub`,
        description: appointment.notes || '',
        start: { dateTime: appointment.start_time, timeZone: 'America/Mexico_City' },
        end: { dateTime: appointment.end_time, timeZone: 'America/Mexico_City' },
        attendees: [
          { email: appointment.client?.email },
          { email: appointment.provider?.email },
        ].filter((a) => a.email),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 },
            { method: 'popup', minutes: 60 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all',
      });

      // Store event ID in appointment
      await query(
        'UPDATE appointments SET google_calendar_event_id = $1 WHERE id = $2',
        [response.data.id, appointment.id]
      );

      return response.data;
    } catch (error) {
      console.error('Google Calendar event creation failed:', error.message);
      // Don't throw — calendar sync is non-critical
      return null;
    }
  },

  /**
   * Update a Google Calendar event
   */
  async updateEvent(userId, appointmentId, data) {
    try {
      const aptResult = await query(
        'SELECT google_calendar_event_id FROM appointments WHERE id = $1',
        [appointmentId]
      );

      const eventId = aptResult.rows[0]?.google_calendar_event_id;
      if (!eventId) return null;

      const authClient = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: {
          start: data.start_time ? { dateTime: data.start_time, timeZone: 'America/Mexico_City' } : undefined,
          end: data.end_time ? { dateTime: data.end_time, timeZone: 'America/Mexico_City' } : undefined,
        },
        sendUpdates: 'all',
      });

      return true;
    } catch (error) {
      console.error('Google Calendar event update failed:', error.message);
      return null;
    }
  },

  /**
   * Delete a Google Calendar event
   */
  async deleteEvent(userId, appointmentId) {
    try {
      const aptResult = await query(
        'SELECT google_calendar_event_id FROM appointments WHERE id = $1',
        [appointmentId]
      );

      const eventId = aptResult.rows[0]?.google_calendar_event_id;
      if (!eventId) return null;

      const authClient = await this.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });

      await query(
        'UPDATE appointments SET google_calendar_event_id = NULL WHERE id = $1',
        [appointmentId]
      );

      return true;
    } catch (error) {
      console.error('Google Calendar event deletion failed:', error.message);
      return null;
    }
  },

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userId) {
    const result = await query(
      'SELECT google_calendar_tokens FROM users WHERE id = $1',
      [userId]
    );

    const tokens = result.rows[0]?.google_calendar_tokens;
    if (!tokens) {
      return { connected: false };
    }

    try {
      const authClient = await this.getAuthenticatedClient(userId);
      const oauth2 = google.oauth2({ version: 'v2', auth: authClient });
      const profile = await oauth2.userinfo.get();

      return {
        connected: true,
        email: profile.data.email,
        last_sync: new Date().toISOString(),
      };
    } catch {
      return { connected: false };
    }
  },

  /**
   * Disconnect Google Calendar
   */
  async disconnect(userId) {
    await query(
      'UPDATE users SET google_calendar_tokens = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );
  },
};
