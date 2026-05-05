import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler.js';

export const staffController = {
  async getStaff(req, res, next) {
    try {
      const result = await query(
        `SELECT s.*,
           COALESCE(
             json_agg(ss.service_id) FILTER (WHERE ss.service_id IS NOT NULL),
             '[]'
           ) as service_ids
         FROM staff s
         LEFT JOIN service_staff ss ON s.id = ss.staff_id
         WHERE s.provider_id = $1
         GROUP BY s.id
         ORDER BY s.name ASC`,
        [req.user.id]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async createStaff(req, res, next) {
    try {
      const { name, email, phone, specialty } = req.body;
      const id = uuidv4();

      const result = await query(
        `INSERT INTO staff (id, provider_id, name, email, phone, specialty)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, req.user.id, name, email || null, phone || null, specialty || null]
      );
      res.status(201).json({ success: true, data: { ...result.rows[0], service_ids: [] } });
    } catch (error) {
      next(error);
    }
  },

  async updateStaff(req, res, next) {
    try {
      const { name, email, phone, specialty, is_active } = req.body;

      const existing = await query(
        'SELECT provider_id FROM staff WHERE id = $1',
        [req.params.staffId]
      );

      if (existing.rows.length === 0) throw new AppError('Trabajador no encontrado', 404);
      if (existing.rows[0].provider_id !== req.user.id) throw new AppError('Sin permisos', 403);

      const result = await query(
        `UPDATE staff
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             specialty = COALESCE($4, specialty),
             is_active = COALESCE($5, is_active),
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [name, email, phone, specialty, is_active, req.params.staffId]
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async deleteStaff(req, res, next) {
    try {
      const existing = await query(
        'SELECT provider_id FROM staff WHERE id = $1',
        [req.params.staffId]
      );

      if (existing.rows.length === 0) throw new AppError('Trabajador no encontrado', 404);
      if (existing.rows[0].provider_id !== req.user.id) throw new AppError('Sin permisos', 403);

      await query('DELETE FROM staff WHERE id = $1', [req.params.staffId]);
      res.json({ success: true, message: 'Trabajador eliminado' });
    } catch (error) {
      next(error);
    }
  },

  async getServiceStaff(req, res, next) {
    try {
      const result = await query(
        `SELECT st.* FROM staff st
         JOIN service_staff ss ON st.id = ss.staff_id
         WHERE ss.service_id = $1`,
        [req.params.serviceId]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async setServiceStaff(req, res, next) {
    try {
      const { staff_ids } = req.body;
      const { serviceId } = req.params;

      // Verify service belongs to provider
      const svc = await query(
        'SELECT provider_id FROM services WHERE id = $1',
        [serviceId]
      );
      if (svc.rows.length === 0) throw new AppError('Servicio no encontrado', 404);
      if (svc.rows[0].provider_id !== req.user.id) throw new AppError('Sin permisos', 403);

      // Replace assignments atomically
      await query('DELETE FROM service_staff WHERE service_id = $1', [serviceId]);

      if (Array.isArray(staff_ids) && staff_ids.length > 0) {
        const values = staff_ids
          .map((_, i) => `($1, $${i + 2})`)
          .join(', ');
        await query(
          `INSERT INTO service_staff (service_id, staff_id) VALUES ${values}`,
          [serviceId, ...staff_ids]
        );
      }

      res.json({ success: true, message: 'Asignaciones actualizadas' });
    } catch (error) {
      next(error);
    }
  },
};
