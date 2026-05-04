import type { AppointmentStatus, NotificationChannel, ReminderTime } from '@/types';

// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Appointment statuses
export const APPOINTMENT_STATUSES: Record<
  AppointmentStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  pending: {
    label: 'Pendiente',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  confirmed: {
    label: 'Confirmada',
    color: 'indigo',
    bgColor: 'bg-primary-100',
    textColor: 'text-primary-700',
  },
  completed: {
    label: 'Completada',
    color: 'green',
    bgColor: 'bg-success-100',
    textColor: 'text-success-700',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'red',
    bgColor: 'bg-error-50',
    textColor: 'text-error-600',
  },
};

// Service types
export const SERVICE_TYPES = [
  { value: 'medical', label: 'Médico', icon: '🏥' },
  { value: 'beauty', label: 'Belleza', icon: '💅' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
  { value: 'financial', label: 'Financiero', icon: '💰' },
  { value: 'educational', label: 'Educativo', icon: '📚' },
  { value: 'therapy', label: 'Terapia', icon: '🧠' },
  { value: 'consulting', label: 'Consultoría', icon: '💼' },
  { value: 'other', label: 'Otro', icon: '🔧' },
] as const;

// Notification channels
export const NOTIFICATION_CHANNELS: Record<NotificationChannel, { label: string; icon: string }> = {
  whatsapp: { label: 'WhatsApp', icon: '📱' },
  telegram: { label: 'Telegram', icon: '✈️' },
  email: { label: 'Email', icon: '📧' },
};

// Reminder times (in minutes)
export const REMINDER_TIMES: Array<{ value: ReminderTime; label: string }> = [
  { value: 15, label: '15 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 día antes' },
];

// Time slot durations (minutes)
export const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120] as const;

// Business hours
export const BUSINESS_HOURS = {
  start: 8, // 8:00 AM
  end: 20, // 8:00 PM
};

// Pagination
export const PAGE_SIZE = 10;

// Auth
export const TOKEN_KEY = 'appointmenthub_token';
export const REFRESH_TOKEN_KEY = 'appointmenthub_refresh_token';
export const USER_KEY = 'appointmenthub_user';

// Query keys
export const QUERY_KEYS = {
  appointments: 'appointments',
  appointment: (id: string) => ['appointments', id],
  services: 'services',
  users: 'users',
  userProfile: (id: string) => ['users', id],
  notifications: 'notifications',
  notificationHistory: 'notification-history',
  availability: (serviceId: string, date: string) => ['availability', serviceId, date],
  reviews: (appointmentId: string) => ['reviews', appointmentId],
  chatHistory: (appointmentId: string) => ['chat', appointmentId],
} as const;

// Nav items
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/calendar', label: 'Calendario', icon: 'Calendar' },
  { path: '/appointments', label: 'Citas', icon: 'ClipboardList' },
  { path: '/chat', label: 'Chat IA', icon: 'MessageSquare' },
  { path: '/settings', label: 'Configuración', icon: 'Settings' },
  { path: '/profile', label: 'Perfil', icon: 'User' },
] as const;

// Feature flags
export const FEATURES = {
  googleCalendar: true,
  whatsappNotifications: true,
  telegramNotifications: true,
  emailNotifications: true,
  aiChat: true,
  analytics: true,
};

// Default avatar placeholder
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&size=128&name=';
