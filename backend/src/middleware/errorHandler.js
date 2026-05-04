import { env } from '../config/env.js';

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, _next) {
  const isDev = env.NODE_ENV === 'development';

  // Log in development
  if (isDev) {
    console.error('Error:', err);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Datos de entrada inválidos',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'InvalidToken',
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'TokenExpired',
      message: 'Token expirado',
    });
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          error: 'DuplicateEntry',
          message: 'Ya existe un registro con esos datos',
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          error: 'InvalidReference',
          message: 'Referencia a registro inexistente',
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          success: false,
          error: 'MissingField',
          message: `Campo requerido: ${err.column}`,
        });
    }
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code || 'ApplicationError',
      message: err.message,
    });
  }

  // Default 500
  return res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: isDev ? err.message : 'Error interno del servidor',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
}

/**
 * Create a custom application error
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'AppError') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}
