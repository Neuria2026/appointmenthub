import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User,
  Appointment,
  AppointmentFilters,
  Message,
  ChatMessage,
  NotificationPreferences,
  NotificationLog,
} from '@/types';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/utils/constants';
import { authService } from '@/services/authService';
import { appointmentService } from '@/services/appointmentService';

// ============================================================
// Auth Store
// ============================================================

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken?: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials.email, credentials.password);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
        } catch (error: unknown) {
          const message = (error as any)?.response?.data?.message || (error instanceof Error ? error.message : 'Error al iniciar sesión');
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => set({ user }),

      setToken: (token, refreshToken) => {
        localStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        set({ token, ...(refreshToken && { refreshToken }), isAuthenticated: true });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================================
// Appointment Store
// ============================================================

interface AppointmentStore {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  filters: AppointmentFilters;
  total: number;
  fetchAppointments: (filters?: AppointmentFilters) => Promise<void>;
  createAppointment: (data: Partial<Appointment>) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  selectAppointment: (appointment: Appointment | null) => void;
  setFilters: (filters: AppointmentFilters) => void;
  clearError: () => void;
}

export const useAppointmentStore = create<AppointmentStore>()((set, get) => ({
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
  filters: { status: 'all', page: 1, limit: 10 },
  total: 0,

  fetchAppointments: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const response = await appointmentService.getAppointments(activeFilters);
      set({
        appointments: response.data,
        total: response.total,
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar citas';
      set({ error: message, isLoading: false });
    }
  },

  createAppointment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const appointment = await appointmentService.createAppointment(data);
      set((state) => ({
        appointments: [appointment, ...state.appointments],
        isLoading: false,
      }));
      return appointment;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear cita';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateAppointment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await appointmentService.updateAppointment(id, data);
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? updated : a)),
        selectedAppointment:
          state.selectedAppointment?.id === id ? updated : state.selectedAppointment,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar cita';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await appointmentService.deleteAppointment(id);
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id),
        selectedAppointment:
          state.selectedAppointment?.id === id ? null : state.selectedAppointment,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar cita';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  selectAppointment: (appointment) => set({ selectedAppointment: appointment }),
  setFilters: (filters) => set({ filters }),
  clearError: () => set({ error: null }),
}));

// ============================================================
// Chat Store
// ============================================================

interface ChatStore {
  messages: Message[];
  conversationHistory: ChatMessage[];
  isLoading: boolean;
  selectedAppointmentId: string | null;
  sendMessage: (content: string) => void;
  addMessage: (message: Message) => void;
  addToHistory: (msg: ChatMessage) => void;
  setSelectedAppointment: (id: string | null) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  conversationHistory: [],
  isLoading: false,
  selectedAppointmentId: null,

  sendMessage: (_content) => {
    // Handled by AIAssistant component
  },

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  addToHistory: (msg) =>
    set((state) => ({ conversationHistory: [...state.conversationHistory, msg] })),

  setSelectedAppointment: (id) => set({ selectedAppointmentId: id }),

  clearHistory: () =>
    set({ messages: [], conversationHistory: [], selectedAppointmentId: null }),

  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================================
// Notification Store
// ============================================================

interface NotificationStore {
  preferences: NotificationPreferences | null;
  history: NotificationLog[];
  isLoading: boolean;
  error: string | null;
  setPreferences: (preferences: NotificationPreferences) => void;
  setHistory: (history: NotificationLog[]) => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  preferences: null,
  history: [],
  isLoading: false,
  error: null,

  setPreferences: (preferences) => set({ preferences }),
  setHistory: (history) => set({ history }),

  updatePreferences: (updates) =>
    set((state) => ({
      preferences: state.preferences ? { ...state.preferences, ...updates } : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
