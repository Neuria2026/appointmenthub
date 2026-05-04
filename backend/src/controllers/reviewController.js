import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler.js';
import { emailService } from '../services/emailService.js';

export const reviewController = {
  async createReview(req, res, next) {
    try {
      const { rating, comment } = req.body;
      const { appointmentId } = req.params;

      // Verify appointment belongs to client and is completed
      const aptResult = await query(
        `SELECT a.*, json_build_object('id', c.id, 'full_name', c.full_name, 'email', c.email) as client,
                      json_build_object('id', p.id, 'full_name', p.full_name) as provider,
                      json_build_object('id', s.id, 'name', s.name) as service
         FROM appointments a
         LEFT JOIN users c ON a.client_id = c.id
         LEFT JOIN users p ON a.provider_id = p.id
         LEFT JOIN services s ON a.service_id = s.id
         WHERE a.id = $1`,
        [appointmentId]
      );

      if (aptResult.rows.length === 0) {
        throw new AppError('Cita no encontrada', 404);
      }

      const appointment = aptResult.rows[0];

      if (appointment.client_id !== req.user.id) {
        throw new AppError('No puedes reseñar esta cita', 403);
      }

      if (appointment.status !== 'completed') {
        throw new AppError('Solo puedes reseñar citas completadas', 400);
      }

      const id = uuidv4();
      const result = await query(
        `INSERT INTO reviews (id, appointment_id, client_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, appointmentId, req.user.id, rating, comment || null]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getAppointmentReview(req, res, next) {
    try {
      const result = await query(
        `SELECT r.*, json_build_object('id', u.id, 'full_name', u.full_name) as client
         FROM reviews r
         LEFT JOIN users u ON r.client_id = u.id
         WHERE r.appointment_id = $1`,
        [req.params.appointmentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getUserReviews(req, res, next) {
    try {
      const result = await query(
        `SELECT r.*,
           json_build_object('id', u.id, 'full_name', u.full_name) as client,
           json_build_object('id', s.id, 'name', s.name) as service
         FROM reviews r
         LEFT JOIN users u ON r.client_id = u.id
         LEFT JOIN appointments a ON r.appointment_id = a.id
         LEFT JOIN services s ON a.service_id = s.id
         WHERE a.provider_id = $1
         ORDER BY r.created_at DESC`,
        [req.params.userId]
      );

      const avgResult = await query(
        `SELECT AVG(r.rating)::numeric(3,2) as average_rating, COUNT(*) as total
         FROM reviews r
         LEFT JOIN appointments a ON r.appointment_id = a.id
         WHERE a.provider_id = $1`,
        [req.params.userId]
      );

      res.json({
        success: true,
        data: result.rows,
        stats: {
          average_rating: parseFloat(avgResult.rows[0].average_rating) || 0,
          total: parseInt(avgResult.rows[0].total),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
