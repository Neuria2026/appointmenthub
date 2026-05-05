import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler.js';

export const userController = {
  async getUser(req, res, next) {
    try {
      const result = await query(
        'SELECT id, email, full_name, phone, address, role, profile_picture_url, logo_url, created_at, updated_at FROM users WHERE id = $1',
        [req.params.id]
      );
      if (result.rows.length === 0) {
        throw new AppError('Usuario no encontrado', 404);
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      if (req.user.id !== req.params.id) {
        throw new AppError('No puedes modificar otro usuario', 403, 'Forbidden');
      }

      const { full_name, phone, address, profile_picture_url } = req.body;
      // logo_url can be explicitly set to null to clear it
      const logo_url = Object.prototype.hasOwnProperty.call(req.body, 'logo_url')
        ? req.body.logo_url
        : undefined;

      const result = await query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             address = COALESCE($3, address),
             profile_picture_url = COALESCE($4, profile_picture_url),
             logo_url = CASE WHEN $5::boolean THEN $6 ELSE logo_url END,
             updated_at = NOW()
         WHERE id = $7
         RETURNING id, email, full_name, phone, address, role, profile_picture_url, logo_url, updated_at`,
        [full_name, phone, address, profile_picture_url,
          logo_url !== undefined, logo_url ?? null,
          req.params.id]
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getUserAppointments(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE (a.client_id = $1 OR a.provider_id = $1)';
      const params = [req.params.id];
      let paramIdx = 2;

      if (status && status !== 'all') {
        whereClause += ` AND a.status = $${paramIdx++}`;
        params.push(status);
      }

      const result = await query(
        `SELECT a.*,
           json_build_object('id', p.id, 'full_name', p.full_name) as provider,
           json_build_object('id', c.id, 'full_name', c.full_name) as client,
           json_build_object('id', s.id, 'name', s.name, 'duration_minutes', s.duration_minutes, 'price', s.price) as service
         FROM appointments a
         LEFT JOIN users p ON a.provider_id = p.id
         LEFT JOIN users c ON a.client_id = c.id
         LEFT JOIN services s ON a.service_id = s.id
         ${whereClause}
         ORDER BY a.start_time DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
        [...params, limit, offset]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async getServices(req, res, next) {
    try {
      const result = await query(
        `SELECT s.*,
           COALESCE(
             json_agg(
               json_build_object('id', st.id, 'name', st.name, 'specialty', st.specialty)
             ) FILTER (WHERE st.id IS NOT NULL),
             '[]'
           ) as staff
         FROM services s
         LEFT JOIN service_staff ss ON s.id = ss.service_id
         LEFT JOIN staff st ON ss.staff_id = st.id
         WHERE s.provider_id = $1
         GROUP BY s.id
         ORDER BY s.created_at DESC`,
        [req.params.id]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async createService(req, res, next) {
    try {
      const { name, duration_minutes, price, description } = req.body;
      const id = uuidv4();

      const result = await query(
        `INSERT INTO services (id, provider_id, name, duration_minutes, price, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, req.user.id, name, duration_minutes, price, description || null]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async updateService(req, res, next) {
    try {
      const { name, duration_minutes, price, description, is_active } = req.body;

      const existing = await query(
        'SELECT provider_id FROM services WHERE id = $1',
        [req.params.serviceId]
      );

      if (existing.rows.length === 0) throw new AppError('Servicio no encontrado', 404);
      if (existing.rows[0].provider_id !== req.user.id) throw new AppError('Sin permisos', 403);

      const result = await query(
        `UPDATE services
         SET name = COALESCE($1, name),
             duration_minutes = COALESCE($2, duration_minutes),
             price = COALESCE($3, price),
             description = COALESCE($4, description),
             is_active = COALESCE($5, is_active)
         WHERE id = $6
         RETURNING *`,
        [name, duration_minutes, price, description, is_active, req.params.serviceId]
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async deleteService(req, res, next) {
    try {
      const existing = await query(
        'SELECT provider_id FROM services WHERE id = $1',
        [req.params.serviceId]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Servicio no encontrado', 404);
      }

      if (existing.rows[0].provider_id !== req.user.id) {
        throw new AppError('No puedes eliminar este servicio', 403);
      }

      await query('DELETE FROM services WHERE id = $1', [req.params.serviceId]);
      res.json({ success: true, message: 'Servicio eliminado' });
    } catch (error) {
      next(error);
    }
  },
};
