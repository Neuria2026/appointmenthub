import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler.js';
import { addMinutes, format } from 'date-fns';
import { env } from '../config/env.js';
import { emailService } from '../services/emailService.js';

const BUSINESS_HOURS = { start: 8, end: 20 };

export const publicController = {
  /**
   * Resolve provider: use ?p=id if given, else the first provider in the DB.
   */
  async _resolveProvider(providerId) {
    if (providerId) {
      const r = await query(
        `SELECT id, full_name, email, phone, address, logo_url
         FROM users WHERE id = $1 AND role = 'provider'`,
        [providerId]
      );
      if (r.rows.length === 0) throw new AppError('Proveedor no encontrado', 404);
      return r.rows[0];
    }
    const r = await query(
      `SELECT id, full_name, email, phone, address, logo_url
       FROM users WHERE role = 'provider' ORDER BY created_at ASC LIMIT 1`
    );
    return r.rows[0] || null;
  },

  /**
   * GET /api/public/info?p=providerId
   */
  async getInfo(req, res, next) {
    try {
      const provider = await publicController._resolveProvider(req.query.p);
      res.json({
        success: true,
        data: { ...(provider || {}), app_name: env.APP_NAME },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/public/services?p=providerId
   */
  async getServices(req, res, next) {
    try {
      const provider = await publicController._resolveProvider(req.query.p);
      if (!provider) return res.json({ success: true, data: [] });

      const result = await query(
        `SELECT s.*,
           COALESCE(
             json_agg(
               json_build_object('id', st.id, 'name', st.name, 'specialty', st.specialty)
             ) FILTER (WHERE st.id IS NOT NULL AND st.is_active = true),
             '[]'
           ) as staff
         FROM services s
         LEFT JOIN service_staff ss ON s.id = ss.service_id
         LEFT JOIN staff st ON ss.staff_id = st.id
         WHERE s.is_active = true AND s.provider_id = $1
         GROUP BY s.id
         ORDER BY s.name ASC`,
        [provider.id]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/public/availability?service_id=&date=&staff_id=
   * Available time slots for a service on a given date
   */
  async getAvailability(req, res, next) {
    try {
      const { service_id, date, staff_id } = req.query;
      if (!service_id || !date) {
        return res.status(400).json({ success: false, message: 'service_id y date son requeridos' });
      }

      const serviceResult = await query(
        'SELECT * FROM services WHERE id = $1 AND is_active = true',
        [service_id]
      );
      if (serviceResult.rows.length === 0) throw new AppError('Servicio no encontrado', 404);

      const service = serviceResult.rows[0];
      const duration = service.duration_minutes;

      const dayStart = `${date}T00:00:00Z`;
      const dayEnd = `${date}T23:59:59Z`;

      // Per-staff conflict check or provider-wide
      const bookedResult = staff_id
        ? await query(
            `SELECT start_time, end_time FROM appointments
             WHERE staff_id = $1 AND status NOT IN ('cancelled')
               AND start_time >= $2 AND start_time <= $3`,
            [staff_id, dayStart, dayEnd]
          )
        : await query(
            `SELECT start_time, end_time FROM appointments
             WHERE provider_id = $1 AND status NOT IN ('cancelled')
               AND start_time >= $2 AND start_time <= $3`,
            [service.provider_id, dayStart, dayEnd]
          );

      const booked = bookedResult.rows;

      // Generate slots
      const slots = [];
      const dateObj = new Date(`${date}T00:00:00Z`);
      let current = new Date(dateObj);
      current.setUTCHours(BUSINESS_HOURS.start, 0, 0, 0);
      const dayEndTime = new Date(dateObj);
      dayEndTime.setUTCHours(BUSINESS_HOURS.end, 0, 0, 0);

      while (current < dayEndTime) {
        const slotEnd = addMinutes(current, duration);
        if (slotEnd > dayEndTime) break;

        const isBooked = booked.some((b) => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return current < bEnd && slotEnd > bStart;
        });

        slots.push({
          time: format(current, 'HH:mm'),
          start: current.toISOString(),
          end: slotEnd.toISOString(),
          available: !isBooked && current > new Date(),
        });

        current = addMinutes(current, duration);
      }

      res.json({ success: true, data: slots });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/public/book
   * Create appointment — finds or creates client account
   */
  async book(req, res, next) {
    try {
      const {
        service_id, staff_id, start_time, end_time,
        client_name, client_email, client_phone, notes,
      } = req.body;

      if (!service_id || !start_time || !end_time || !client_name || !client_email) {
        throw new AppError('Faltan datos obligatorios', 400, 'ValidationError');
      }

      // Get service + provider
      const svcResult = await query(
        `SELECT s.*, u.id as uid, u.full_name as provider_name, u.email as provider_email
         FROM services s JOIN users u ON s.provider_id = u.id
         WHERE s.id = $1 AND s.is_active = true`,
        [service_id]
      );
      if (svcResult.rows.length === 0) throw new AppError('Servicio no encontrado', 404);

      const svc = svcResult.rows[0];
      const provider_id = svc.provider_id;

      // Check conflict
      const conflictResult = staff_id
        ? await query(
            `SELECT id FROM appointments WHERE staff_id = $1 AND status NOT IN ('cancelled')
             AND tstzrange(start_time, end_time) && tstzrange($2::timestamptz, $3::timestamptz)`,
            [staff_id, start_time, end_time]
          )
        : await query(
            `SELECT id FROM appointments WHERE provider_id = $1 AND status NOT IN ('cancelled')
             AND tstzrange(start_time, end_time) && tstzrange($2::timestamptz, $3::timestamptz)`,
            [provider_id, start_time, end_time]
          );

      if (conflictResult.rows.length > 0) {
        throw new AppError('Este horario ya no está disponible', 409, 'TimeConflict');
      }

      // Find or create client
      const existing = await query(
        'SELECT * FROM users WHERE email = $1',
        [client_email.toLowerCase().trim()]
      );

      let clientUser;
      if (existing.rows.length > 0) {
        clientUser = existing.rows[0];
        // Update phone/name if empty
        if (!clientUser.phone && client_phone) {
          await query('UPDATE users SET phone = $1 WHERE id = $2', [client_phone, clientUser.id]);
          clientUser.phone = client_phone;
        }
      } else {
        const clientId = uuidv4();
        const passwordHash = await bcrypt.hash(uuidv4(), 10);
        const newUser = await query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, role)
           VALUES ($1, $2, $3, $4, $5, 'client') RETURNING *`,
          [clientId, client_email.toLowerCase().trim(), passwordHash, client_name, client_phone || null]
        );
        clientUser = newUser.rows[0];
        await query(
          `INSERT INTO notification_preferences (id, user_id, channels, reminder_times)
           VALUES ($1, $2, '["email"]', '[60, 1440]') ON CONFLICT DO NOTHING`,
          [uuidv4(), clientId]
        );
      }

      // Create appointment
      const appointmentId = uuidv4();
      await query(
        `INSERT INTO appointments (id, provider_id, client_id, service_id, staff_id, start_time, end_time, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
        [appointmentId, provider_id, clientUser.id, service_id, staff_id || null, start_time, end_time, notes || null]
      );

      // Staff info
      let staffInfo = null;
      if (staff_id) {
        const stResult = await query('SELECT name, specialty FROM staff WHERE id = $1', [staff_id]);
        staffInfo = stResult.rows[0] || null;
      }

      // Confirmation email (async)
      const appointmentForEmail = {
        id: appointmentId,
        start_time,
        end_time,
        service: { name: svc.name },
        provider: { full_name: svc.provider_name, email: svc.provider_email },
        client: clientUser,
      };
      emailService.sendAppointmentConfirmation(appointmentForEmail, clientUser).catch(console.error);

      res.status(201).json({
        success: true,
        data: {
          appointment_id: appointmentId,
          service: { name: svc.name, duration_minutes: svc.duration_minutes, price: Number(svc.price) },
          staff: staffInfo,
          start_time,
          end_time,
          client_name: clientUser.full_name,
          client_email: clientUser.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
