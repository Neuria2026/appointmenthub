import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'El nombre completo es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Ingresa un email válido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirm_password: z.string().min(1, 'Confirma tu contraseña'),
    role: z.enum(['client', 'provider'], { required_error: 'Selecciona un rol' }),
    terms: z.boolean().refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

// Profile validators
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s\-()]{7,20}$/.test(val),
      'Ingresa un número de teléfono válido'
    ),
  address: z.string().max(200, 'La dirección no puede exceder 200 caracteres').optional(),
  profile_picture_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

// Service validators
export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del servicio es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  duration_minutes: z
    .number({ required_error: 'La duración es requerida' })
    .min(15, 'La duración mínima es 15 minutos')
    .max(480, 'La duración máxima es 8 horas'),
  price: z
    .number({ required_error: 'El precio es requerido' })
    .min(0, 'El precio no puede ser negativo'),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
});

// Appointment validators
export const appointmentSchema = z.object({
  service_id: z.string().min(1, 'Selecciona un servicio'),
  date: z.string().min(1, 'Selecciona una fecha'),
  start_time: z.string().min(1, 'Selecciona un horario'),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

// Review validators
export const reviewSchema = z.object({
  rating: z
    .number({ required_error: 'La calificación es requerida' })
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  comment: z.string().max(1000, 'El comentario no puede exceder 1000 caracteres').optional(),
});

// Notification preferences validators
export const notificationPreferencesSchema = z.object({
  channels: z.array(z.enum(['whatsapp', 'telegram', 'email'])),
  reminder_times: z.array(z.number()),
  phone_whatsapp: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s\-()]{7,20}$/.test(val),
      'Número de WhatsApp inválido'
    ),
  telegram_id: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ServiceFormValues = z.infer<typeof serviceSchema>;
export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
export type NotificationPreferencesFormValues = z.infer<typeof notificationPreferencesSchema>;
