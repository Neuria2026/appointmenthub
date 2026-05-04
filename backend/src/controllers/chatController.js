import { claudeService } from '../services/claudeService.js';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { appointmentService } from '../services/appointmentService.js';

export const chatController = {
  async sendMessage(req, res, next) {
    try {
      const { message, appointment_id, history } = req.body;

      // Get appointment context if provided
      let appointmentContext = null;
      if (appointment_id) {
        try {
          appointmentContext = await appointmentService.getAppointmentById(
            appointment_id,
            req.user.id
          );
        } catch {
          // Ignore if appointment not found
        }
      }

      // Call Claude API
      const result = await claudeService.callClaudeAPI(
        message,
        appointmentContext,
        history || []
      );

      // Store messages in DB (async, don't await)
      if (appointment_id) {
        const userMsgId = uuidv4();
        const assistantMsgId = uuidv4();

        query(
          `INSERT INTO messages (id, appointment_id, sender_id, content) VALUES ($1, $2, $3, $4)`,
          [userMsgId, appointment_id, req.user.id, message]
        ).catch(console.error);

        query(
          `INSERT INTO messages (id, appointment_id, sender_id, content) VALUES ($1, $2, NULL, $3)`,
          [assistantMsgId, appointment_id, result.message]
        ).catch(console.error);
      }

      res.json({
        success: true,
        message: result.message,
        appointment_id: appointment_id || null,
      });
    } catch (error) {
      next(error);
    }
  },

  async getChatHistory(req, res, next) {
    try {
      const { appointmentId } = req.params;

      // Verify access to appointment
      try {
        await appointmentService.getAppointmentById(appointmentId, req.user.id);
      } catch {
        return res.status(403).json({ success: false, message: 'Sin acceso a esta cita' });
      }

      const result = await query(
        `SELECT m.*,
           CASE WHEN m.sender_id IS NULL THEN 'assistant' ELSE 'user' END as role
         FROM messages m
         WHERE m.appointment_id = $1
         ORDER BY m.created_at ASC`,
        [appointmentId]
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },
};
