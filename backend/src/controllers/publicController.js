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
        `SELECT id, full_name, email, phone, address FROM users WHERE id = $1 AND role = 'provider'`,
        [providerId]
      );
      if (r.rows.length === 0) throw new AppError('Proveedor no encontrado', 404);
      return r.rows[0];
    }
    const r = await query(
      `SELECT id, full_name, email, phone, address FROM users WHERE role = 'provider' ORDER BY created_at ASC LIMIT 1`
    );
    return r.rows[0] || null;
  },

  /**
   * GET /api/public/info?p=providerId
   */
  async getInfo(req, res, next) {
    try {
      const provider = await publicController._resolveProvider(req.query.p);
      let logo_url = null;
      if (provider) {
        try {
          const lr = await query('SELECT logo_url FROM users WHERE id = $1', [provider.id]);
          logo_url = lr.rows[0]?.logo_url ?? null;
        } catch {
          // logo_url column may not exist yet
        }
      }
      res.json({
        success: true,
        data: { ...(provider || {}), logo_url, app_name: env.APP_NAME },
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
             (
               SELECT json_agg(json_build_object('id', st.id, 'name', st.name, 'specialty', st.specialty))
               FROM service_staff ss
               JOIN staff st ON ss.staff_id = st.id
               WHERE ss.service_id = s.id AND st.is_active = true
             ),
             '[]'::json
           ) as staff
         FROM services s
         WHERE s.is_active = true AND s.provider_id = $1
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

      // Find or create client (or use authenticated client)
      let clientUser;
      if (req.user && req.user.role === 'client') {
        const r = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        clientUser = r.rows[0];
      } else {
        const existing = await query(
          'SELECT * FROM users WHERE email = $1',
          [client_email.toLowerCase().trim()]
        );
        if (existing.rows.length > 0) {
          clientUser = existing.rows[0];
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
      }

      // Anchor client to this provider if not already anchored
      if (!clientUser.assigned_provider_id) {
        await query(
          'UPDATE users SET assigned_provider_id = $1 WHERE id = $2 AND role = $3',
          [provider_id, clientUser.id, 'client']
        );
        clientUser.assigned_provider_id = provider_id;
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

  /**
   * GET /api/public/my-provider
   * Returns the provider the authenticated client is anchored to.
   */
  async getMyProvider(req, res, next) {
    try {
      const r = await query(
        `SELECT u.id, u.full_name, u.email, u.phone, u.address, p.id as provider_id,
                p.full_name as provider_name, p.email as provider_email,
                p.phone as provider_phone, p.address as provider_address
         FROM users u
         LEFT JOIN users p ON u.assigned_provider_id = p.id AND p.role = 'provider'
         WHERE u.id = $1`,
        [req.user.id]
      );
      if (r.rows.length === 0) throw new AppError('Usuario no encontrado', 404);
      const row = r.rows[0];
      let logo_url = null;
      if (row.provider_id) {
        try {
          const lr = await query('SELECT logo_url FROM users WHERE id = $1', [row.provider_id]);
          logo_url = lr.rows[0]?.logo_url ?? null;
        } catch { /* column may be missing */ }
      }
      res.json({
        success: true,
        data: {
          client: {
            id: row.id,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
            address: row.address,
          },
          provider: row.provider_id ? {
            id: row.provider_id,
            full_name: row.provider_name,
            email: row.provider_email,
            phone: row.provider_phone,
            address: row.provider_address,
            logo_url,
          } : null,
          app_name: env.APP_NAME,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/public/my-appointments
   * Lists the authenticated client's appointments, newest first.
   */
  async getMyAppointments(req, res, next) {
    try {
      const r = await query(
        `SELECT a.id, a.start_time, a.end_time, a.status, a.notes, a.created_at,
                s.name as service_name, s.duration_minutes, s.price,
                p.full_name as provider_name,
                st.name as staff_name, st.specialty as staff_specialty
         FROM appointments a
         JOIN services s ON a.service_id = s.id
         JOIN users p ON a.provider_id = p.id
         LEFT JOIN staff st ON a.staff_id = st.id
         WHERE a.client_id = $1
         ORDER BY a.start_time DESC`,
        [req.user.id]
      );
      res.json({
        success: true,
        data: r.rows.map((a) => ({
          id: a.id,
          start_time: a.start_time,
          end_time: a.end_time,
          status: a.status,
          notes: a.notes,
          service: { name: a.service_name, duration_minutes: a.duration_minutes, price: Number(a.price) },
          provider: { full_name: a.provider_name },
          staff: a.staff_name ? { name: a.staff_name, specialty: a.staff_specialty } : null,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/public/set-password
   * Lets a client set a real password on their account (after first booking).
   */
  async setPassword(req, res, next) {
    try {
      const { password } = req.body;
      if (!password || password.length < 6) {
        throw new AppError('La contraseña debe tener al menos 6 caracteres', 400, 'ValidationError');
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2 AND role = $3',
        [passwordHash, req.user.id, 'client']);
      res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (error) {
      next(error);
    }
  },
};
