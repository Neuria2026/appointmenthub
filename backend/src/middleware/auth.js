import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/database.js';

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No se proporcionó token de autenticación',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'TokenExpired',
          message: 'El token ha expirado',
        });
      }
      return res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Token inválido',
      });
    }

    // Verify user still exists in DB
    const result = await query(
      'SELECT id, email, full_name, role, profile_picture_url FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'UserNotFound',
        message: 'Usuario no encontrado',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require specific role(s)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'No tienes permiso para esta acción',
      });
    }
    next();
  };
}

/**
 * Optional auth — attach user if token present, but don't require it
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
}
