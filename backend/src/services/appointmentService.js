import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { addMinutes, format } from 'date-fns';

const BUSINESS_HOURS = { start: 8, end: 20 };

export const appointmentService = {
  /**
   * Get appointments with filters
   */
  async getAppointments({ userId, role, status, start_date, end_date, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    // Role-based filtering
    if (role === 'client') {
      conditions.push(`a.client_id = $${paramIdx++}`);
      params.push(userId);
    } else if (role === 'provider') {
      conditions.push(`a.provider_id = $${paramIdx++}`);
      params.push(userId);
    }

    if (status && status !== 'all') {
      conditions.push(`a.status = $${paramIdx++}`);
      params.push(status);
    }

    if (start_date) {
      conditions.push(`a.start_time >= $${paramIdx++}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`a.start_time <= $${paramIdx++}`);
      params.push(end_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM appointments a ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT
         a.*,
         json_build_object('id', p.id, 'full_name', p.full_name, 'email', p.email, 'phone', p.phone) as provider,
         json_build_object('id', c.id, 'full_name', c.full_name, 'email', c.email, 'phone', c.phone) as client,
         json_build_object('id', s.id, 'name', s.name, 'duration_minutes', s.duration_minutes, 'price', s.price) as service,
         json_build_object('id', r.id, 'rating', r.rating, 'comment', r.comment) as review
       FROM appointments a
       LEFT JOIN users p ON a.provider_id = p.id
       LEFT JOIN users c ON a.client_id = c.id
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN reviews r ON r.appointment_id = a.id
       ${whereClause}
       ORDER BY a.start_time DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      [...params, limit, offset]
    );

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(countResult.rows[0].count / limit),
    };
  },

  /**
   * Get single appointment by ID
   */
  async getAppointmentById(id, userId) {
    const result = await query(
      `SELECT
         a.*,
         json_build_object('id', p.id, 'full_name', p.full_name, 'email', p.email, 'phone', p.phone) as provider,
         json_build_object('id', c.id, 'full_name', c.full_name, 'email', c.email, 'phone', c.phone) as client,
         json_build_object('id', s.id, 'name', s.name, 'duration_minutes', s.duration_minutes, 'price', s.price, 'description', s.description) as service,
         json_build_object('id', r.id, 'rating', r.rating, 'comment', r.comment, 'created_at', r.created_at) as review
       FROM appointments a
       LEFT JOIN users p ON a.provider_id = p.id
       LEFT JOIN users c ON a.client_id = c.id
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN reviews r ON r.appointment_id = a.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Cita no encontrada', 404, 'AppointmentNotFound');
    }

    const apt = result.rows[0];

    // Check access
    if (userId && apt.client_id !== userId && apt.provider_id !== userId) {
      throw new AppError('No tienes acceso a esta cita', 403, 'Forbidden');
    }

    return apt;
  },

  /**
   * Create appointment with conflict detection
   */
  async createAppointment({ service_id, start_time, end_time, notes, client_id }) {
    return transaction(async (client) => {
      // Get service and provider
      const serviceResult = await client.query(
        'SELECT * FROM services WHERE id = $1',
        [service_id]
      );

      if (serviceResult.rows.length === 0) {
        throw new AppError('Servicio no encontrado', 404, 'ServiceNotFound');
      }

      const service = serviceResult.rows[0];
      const provider_id = service.provider_id;

      // Check for conflicts
      const conflictResult = await client.query(
        `SELECT id FROM appointments
         WHERE provider_id = $1
           AND status NOT IN ('cancelled')
           AND tstzrange(start_time, end_time) && tstzrange($2::timestamptz, $3::timestamptz)`,
        [provider_id, start_time, end_time]
      );

      if (conflictResult.rows.length > 0) {
        throw new AppError('El horario no está disponible', 409, 'TimeConflict');
      }

      const id = uuidv4();
      const result = await client.query(
        `INSERT INTO appointments (id, provider_id, client_id, service_id, start_time, end_time, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
         RETURNING *`,
        [id, provider_id, client_id, service_id, start_time, end_time, notes || null]
      );

      return result.rows[0];
    });
  },

  /**
   * Update appointment
   */
  async updateAppointment(id, data, userId) {
    const existing = await this.getAppointmentById(id, userId);

    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (data.status !== undefined) {
      fields.push(`status = $${paramIdx++}`);
      params.push(data.status);
    }
    if (data.start_time !== undefined) {
      fields.push(`start_time = $${paramIdx++}`);
      params.push(data.start_time);
    }
    if (data.end_time !== undefined) {
      fields.push(`end_time = $${paramIdx++}`);
      params.push(data.end_time);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${paramIdx++}`);
      params.push(data.notes);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );

    return result.rows[0];
  },

  /**
   * Delete appointment
   */
  async deleteAppointment(id, userId) {
    const existing = await this.getAppointmentById(id, userId);

    if (['completed', 'cancelled'].includes(existing.status)) {
      throw new AppError('No se puede eliminar esta cita', 400, 'InvalidOperation');
    }

    await query('UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2', [
      'cancelled',
      id,
    ]);
  },

  /**
   * Complete appointment
   */
  async completeAppointment(id, userId) {
    const existing = await this.getAppointmentById(id, userId);

    if (existing.status !== 'confirmed' && existing.status !== 'pending') {
      throw new AppError('Solo se pueden completar citas confirmadas', 400);
    }

    const result = await query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['completed', id]
    );

    return result.rows[0];
  },

  /**
   * Get available time slots for a service on a given date
   */
  async getAvailableSlots(service_id, date) {
    const serviceResult = await query('SELECT * FROM services WHERE id = $1', [service_id]);
    if (serviceResult.rows.length === 0) {
      throw new AppError('Servicio no encontrado', 404);
    }

    const service = serviceResult.rows[0];
    const duration = service.duration_minutes;
    const provider_id = service.provider_id;

    // Get booked appointments for this day
    const dayStart = `${date}T00:00:00Z`;
    const dayEnd = `${date}T23:59:59Z`;

    const bookedResult = await query(
      `SELECT start_time, end_time FROM appointments
       WHERE provider_id = $1
         AND status NOT IN ('cancelled')
         AND start_time >= $2
         AND start_time <= $3`,
      [provider_id, dayStart, dayEnd]
    );

    const booked = bookedResult.rows;

    // Build slots
    const slots = [];
    const dateObj = new Date(date + 'T00:00:00Z');
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

      const isInPast = current < new Date();

      slots.push({
        time: format(current, 'HH:mm'),
        start: current.toISOString(),
        end: slotEnd.toISOString(),
        available: !isBooked && !isInPast,
      });

      current = addMinutes(current, duration);
    }

    return slots;
  },
};
