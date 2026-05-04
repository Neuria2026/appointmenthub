import { appointmentService } from '../services/appointmentService.js';
import { sendConfirmationNotification } from '../services/notificationScheduler.js';
import { googleCalendarService } from '../services/googleCalendarService.js';
import { query } from '../config/database.js';

export const appointmentController = {
  async getAppointments(req, res, next) {
    try {
      const { status, start_date, end_date, page, limit } = req.query;
      const result = await appointmentService.getAppointments({
        userId: req.user.id,
        role: req.user.role,
        status,
        start_date,
        end_date,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getAppointment(req, res, next) {
    try {
      const appointment = await appointmentService.getAppointmentById(req.params.id, req.user.id);
      res.json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  },

  async createAppointment(req, res, next) {
    try {
      const appointment = await appointmentService.createAppointment({
        ...req.body,
        client_id: req.user.id,
      });

      // Get full appointment with relations for notifications
      const fullAppointment = await appointmentService.getAppointmentById(appointment.id, null);

      // Get notification preferences
      const prefResult = await query(
        'SELECT * FROM notification_preferences WHERE user_id = $1',
        [req.user.id]
      );
      const prefs = prefResult.rows[0] || {};

      // Send confirmation notifications (async, don't await)
      sendConfirmationNotification({ ...fullAppointment, ...prefs }).catch(console.error);

      // Sync to Google Calendar (async)
      googleCalendarService.createEvent(req.user.id, fullAppointment).catch(console.error);

      res.status(201).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  },

  async updateAppointment(req, res, next) {
    try {
      const prevAppointment = await appointmentService.getAppointmentById(req.params.id, req.user.id);
      const appointment = await appointmentService.updateAppointment(
        req.params.id,
        req.body,
        req.user.id
      );

      // If rescheduled, update Google Calendar
      if (req.body.start_time || req.body.end_time) {
        googleCalendarService.updateEvent(req.user.id, req.params.id, req.body).catch(console.error);
      }

      res.json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  },

  async deleteAppointment(req, res, next) {
    try {
      await appointmentService.deleteAppointment(req.params.id, req.user.id);
      googleCalendarService.deleteEvent(req.user.id, req.params.id).catch(console.error);
      res.json({ success: true, message: 'Cita eliminada' });
    } catch (error) {
      next(error);
    }
  },

  async completeAppointment(req, res, next) {
    try {
      const appointment = await appointmentService.completeAppointment(
        req.params.id,
        req.user.id
      );
      res.json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  },

  async getAvailability(req, res, next) {
    try {
      const { service_id, date } = req.query;
      if (!service_id || !date) {
        return res.status(400).json({
          success: false,
          message: 'service_id y date son requeridos',
        });
      }
      const slots = await appointmentService.getAvailableSlots(service_id, date);
      res.json({ success: true, data: slots });
    } catch (error) {
      next(error);
    }
  },
};
