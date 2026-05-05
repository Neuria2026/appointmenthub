import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/store';
import { authService } from '@/services/authService';
import type { RegisterFormData } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    token,
    isAuthenticated,
    isLoading: storeLoading,
    error: storeError,
    login: storeLogin,
    logout: storeLogout,
    setUser,
    clearError,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await storeLogin({ email, password });
        toast.success('¡Bienvenido de vuelta!');
        const role = useAuthStore.getState().user?.role;
        navigate(role === 'client' ? '/client' : '/dashboard');
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al iniciar sesión. Intenta de nuevo.';
        setError(message);
        toast.error(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [storeLogin, navigate]
  );

  const register = useCallback(
    async (data: RegisterFormData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.register({
          full_name: data.full_name,
          email: data.email,
          password: data.password,
          role: data.role,
        });
        // Store the token and user from register response
        useAuthStore.getState().setToken(response.token, response.refresh_token);
        useAuthStore.getState().setUser(response.user);
        toast.success('¡Cuenta creada exitosamente!');
        navigate('/profile');
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al crear la cuenta. Intenta de nuevo.';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      storeLogout();
      navigate('/login');
      toast.success('Has cerrado sesión');
    }
  }, [storeLogout, navigate]);

  const refreshCurrentUser = useCallback(async () => {
    if (!token) return;
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // Token might be invalid
      storeLogout();
    }
  }, [token, setUser, storeLogout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || storeLoading,
    error: error || storeError,
    login,
    logout,
    register,
    refreshCurrentUser,
    clearError,
  };
}
