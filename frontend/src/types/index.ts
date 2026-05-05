// ============================================================
// Core Domain Types
// ============================================================

export type UserRole = 'client' | 'provider' | 'admin';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type NotificationChannel = 'whatsapp' | 'telegram' | 'email';

export type ReminderTime = 15 | 60 | 1440; // minutes

// ============================================================
// User
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: UserRole;
  profile_picture_url?: string;
  logo_url?: string;
  google_calendar_connected?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Staff
// ============================================================

export interface Staff {
  id: string;
  provider_id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  is_active: boolean;
  service_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface StaffFormData {
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
}

export interface UserProfile extends User {
  services?: Service[];
  notification_preferences?: NotificationPreferences;
}

// ============================================================
// Service
// ============================================================

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  provider?: Pick<User, 'id' | 'full_name' | 'email'>;
  staff?: Pick<Staff, 'id' | 'name' | 'specialty'>[];
}

// ============================================================
// Appointment
// ============================================================

export interface Appointment {
  id: string;
  provider_id: string;
  client_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  google_calendar_event_id?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  provider?: Pick<User, 'id' | 'full_name' | 'email' | 'phone'>;
  client?: Pick<User, 'id' | 'full_name' | 'email' | 'phone'>;
  service?: Service;
  review?: Review;
}

export interface AppointmentFormData {
  service_id: string;
  date: string;
  start_time: string;
  notes?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus | 'all';
  start_date?: string;
  end_date?: string;
  provider_id?: string;
  client_id?: string;
  page?: number;
  limit?: number;
}

export interface TimeSlot {
  time: string; // "HH:MM"
  available: boolean;
  start: Date;
  end: Date;
}

// ============================================================
// Review
// ============================================================

export interface Review {
  id: string;
  appointment_id: string;
  client_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  created_at: string;
  client?: Pick<User, 'id' | 'full_name'>;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
}

// ============================================================
// Message / Chat
// ============================================================

export interface Message {
  id: string;
  appointment_id?: string;
  sender_id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SendMessageRequest {
  message: string;
  appointment_id?: string;
  history: ChatMessage[];
}

// ============================================================
// Notifications
// ============================================================

export interface NotificationPreferences {
  id: string;
  user_id: string;
  channels: NotificationChannel[];
  reminder_times: ReminderTime[];
  phone_whatsapp?: string;
  telegram_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  appointment_id: string;
  channel: NotificationChannel;
  type: 'confirmation' | 'reminder' | 'reschedule' | 'cancellation' | 'feedback';
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  appointment?: Pick<Appointment, 'id' | 'start_time' | 'service'>;
}

// ============================================================
// API Responses
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

// ============================================================
// Analytics
// ============================================================

export interface MonthlyStats {
  month: string;
  appointments: number;
  revenue: number;
  completed: number;
  cancelled: number;
}

export interface DashboardStats {
  total_appointments: number;
  upcoming_appointments: number;
  completed_this_month: number;
  revenue_this_month: number;
  monthly_data: MonthlyStats[];
  top_clients?: Array<{
    client: Pick<User, 'id' | 'full_name'>;
    count: number;
  }>;
}

// ============================================================
// Form Schemas (used with zod)
// ============================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  terms: boolean;
}

export interface ProfileFormData {
  full_name: string;
  phone?: string;
  address?: string;
  profile_picture_url?: string;
}

export interface ServiceFormData {
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
}

// ============================================================
// Store Types
// ============================================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  filters: AppointmentFilters;
}

export interface ChatState {
  messages: Message[];
  conversationHistory: ChatMessage[];
  isLoading: boolean;
  selectedAppointmentId: string | null;
}

export interface NotificationState {
  preferences: NotificationPreferences | null;
  history: NotificationLog[];
  isLoading: boolean;
}
