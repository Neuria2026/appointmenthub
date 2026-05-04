import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return res.status(400).json({ success: false, message: 'refresh_token requerido' });
      }
      const result = await authService.refreshToken(refresh_token);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    // JWT is stateless — client removes token on their side
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  },

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  },

  async googleCallback(req, res, next) {
    try {
      const { code, state: userId } = req.query;
      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/settings?error=google_auth_failed`);
      }

      const { googleCalendarService } = await import('../services/googleCalendarService.js');
      await googleCalendarService.handleCallback(code, userId || req.user?.id);

      res.redirect(`${process.env.FRONTEND_URL}/settings?google_calendar=connected`);
    } catch (error) {
      next(error);
    }
  },
};
