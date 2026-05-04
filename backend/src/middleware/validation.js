import { z } from 'zod';

/**
 * Middleware factory for Zod validation
 * @param {z.ZodSchema} schema
 * @param {'body' | 'params' | 'query'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data; // Replace with parsed/transformed data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Datos de entrada inválidos',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * Common validation schemas
 */
export const schemas = {
  uuid: z.object({ id: z.string().uuid('ID inválido') }),

  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),

  register: z.object({
    full_name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['client', 'provider']),
    phone: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),

  createAppointment: z.object({
    service_id: z.string().uuid(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    notes: z.string().max(500).optional(),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  }),

  updateAppointment: z.object({
    start_time: z.string().datetime().optional(),
    end_time: z.string().datetime().optional(),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
    notes: z.string().max(500).optional().nullable(),
    cancellation_reason: z.string().max(500).optional(),
  }),

  createService: z.object({
    name: z.string().min(2).max(100),
    duration_minutes: z.number().int().min(15).max(480),
    price: z.number().min(0),
    description: z.string().max(500).optional(),
  }),

  createReview: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),

  updateNotificationPreferences: z.object({
    channels: z.array(z.enum(['whatsapp', 'telegram', 'email'])),
    reminder_times: z.array(z.number().int()),
    phone_whatsapp: z.string().optional().nullable(),
    telegram_id: z.string().optional().nullable(),
  }),

  sendMessage: z.object({
    message: z.string().min(1).max(2000),
    appointment_id: z.string().uuid().optional(),
    history: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).default([]),
  }),
};
