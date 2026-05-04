import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Briefcase, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '@/utils/validators';
import type { UserRole } from '@/types';

export function RegisterForm() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client', terms: false },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser(data);
  };

  const roleOptions: Array<{ value: UserRole; label: string; description: string; icon: typeof User }> = [
    {
      value: 'client',
      label: 'Cliente',
      description: 'Reserva citas con proveedores de servicios',
      icon: User,
    },
    {
      value: 'provider',
      label: 'Proveedor',
      description: 'Ofrece servicios y gestiona tu agenda',
      icon: Briefcase,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full name */}
      <div>
        <label htmlFor="full_name" className="label-base">
          Nombre completo
        </label>
        <input
          id="full_name"
          type="text"
          placeholder="Juan García"
          autoComplete="name"
          className={errors.full_name ? 'input-error' : 'input-base'}
          {...register('full_name')}
        />
        {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="label-base">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="tu@ejemplo.com"
          autoComplete="email"
          className={errors.email ? 'input-error' : 'input-base'}
          {...register('email')}
        />
        {errors.email && <p className="error-text">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="label-base">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            className={clsx(errors.password ? 'input-error' : 'input-base', 'pr-10')}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="error-text">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirm_password" className="label-base">
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            id="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            className={clsx(errors.confirm_password ? 'input-error' : 'input-base', 'pr-10')}
            {...register('confirm_password')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="error-text">{errors.confirm_password.message}</p>
        )}
      </div>

      {/* Role Selector */}
      <div>
        <label className="label-base">Tipo de cuenta</label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {roleOptions.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value)}
              className={clsx(
                'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                selectedRole === value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  selectedRole === value
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p
                  className={clsx(
                    'text-sm font-semibold',
                    selectedRole === value ? 'text-primary-700' : 'text-gray-700'
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>
        {errors.role && <p className="error-text">{errors.role.message}</p>}
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2">
        <input
          id="terms"
          type="checkbox"
          className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
          {...register('terms')}
        />
        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
          Acepto los{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Términos de Servicio
          </a>{' '}
          y la{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Política de Privacidad
          </a>
        </label>
      </div>
      {errors.terms && <p className="error-text -mt-2">{errors.terms.message}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear Cuenta Gratis'
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
