import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const notificationController = {
  async getPreferences(req, res, next) {
    try {
      const result = await query(
        'SELECT * FROM notification_preferences WHERE user_id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        // Create defaults
        const id = uuidv4();
        const inserted = await query(
          `INSERT INTO notification_preferences (id, user_id, channels, reminder_times)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [id, req.user.id, JSON.stringify(['email']), JSON.stringify([60, 1440])]
        );
        return res.json({ success: true, data: inserted.rows[0] });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const { channels, reminder_times, phone_whatsapp, telegram_id } = req.body;

      const result = await query(
        `INSERT INTO notification_preferences (id, user_id, channels, reminder_times, phone_whatsapp, telegram_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE
         SET channels = $3,
             reminder_times = $4,
             phone_whatsapp = $5,
             telegram_id = $6,
             updated_at = NOW()
         RETURNING *`,
        [
          uuidv4(),
          req.user.id,
          JSON.stringify(channels || []),
          JSON.stringify(reminder_times || []),
          phone_whatsapp || null,
          telegram_id || null,
        ]
      );

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const { channel, status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const conditions = ['nl.user_id = $1'];
      const params = [req.user.id];
      let paramIdx = 2;

      if (channel) {
        conditions.push(`nl.channel = $${paramIdx++}`);
        params.push(channel);
      }

      if (status) {
        conditions.push(`nl.status = $${paramIdx++}`);
        params.push(status);
      }

      const result = await query(
        `SELECT nl.*,
           json_build_object('id', a.id, 'start_time', a.start_time,
             'service', json_build_object('id', s.id, 'name', s.name)) as appointment
         FROM notification_log nl
         LEFT JOIN appointments a ON nl.appointment_id = a.id
         LEFT JOIN services s ON a.service_id = s.id
         WHERE ${conditions.join(' AND ')}
         ORDER BY nl.sent_at DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
        [...params, limit, offset]
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },
};
