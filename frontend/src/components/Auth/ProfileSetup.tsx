import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, Plus, Trash2, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { profileSchema, serviceSchema, type ProfileFormValues, type ServiceFormValues } from '@/utils/validators';
import { useAuthStore } from '@/store/store';
import { appointmentService } from '@/services/appointmentService';
import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '@/utils/constants';

const STEPS = [
  { id: 1, label: 'Información Personal' },
  { id: 2, label: 'Servicios' },
  { id: 3, label: 'Completado' },
];

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isProvider = user?.role === 'provider';
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<ServiceFormValues[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const serviceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', duration_minutes: 60, price: 0 },
  });

  const totalSteps = isProvider ? 3 : 2;

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.put(
        `${API_BASE_URL}/api/users/${user?.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (isProvider) {
        setStep(2);
      } else {
        setStep(3);
      }
    } catch {
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddService = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      await appointmentService.createService(data);
      setServices((prev) => [...prev, data]);
      serviceForm.reset();
      setShowServiceForm(false);
      toast.success('Servicio agregado');
    } catch {
      toast.error('Error al agregar servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.slice(0, isProvider ? 3 : 2).map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  step >= s.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
              </div>
              {idx < (isProvider ? 2 : 1) && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-2 w-16 sm:w-24 transition-all',
                    step > s.id ? 'bg-primary-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">
          Paso {step} de {totalSteps}: {STEPS[step - 1]?.label}
        </p>
      </div>

      {/* Step 1: Profile Info */}
      {step === 1 && (
        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold ring-4 ring-primary-200">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Upload className="w-4 h-4" />
              Subir foto (próximamente)
            </button>
          </div>

          <div>
            <label className="label-base">Nombre completo</label>
            <input
              type="text"
              className={profileForm.formState.errors.full_name ? 'input-error' : 'input-base'}
              {...profileForm.register('full_name')}
            />
            {profileForm.formState.errors.full_name && (
              <p className="error-text">{profileForm.formState.errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="label-base">Teléfono</label>
            <input
              type="tel"
              placeholder="+52 55 1234 5678"
              className={profileForm.formState.errors.phone ? 'input-error' : 'input-base'}
              {...profileForm.register('phone')}
            />
            {profileForm.formState.errors.phone && (
              <p className="error-text">{profileForm.formState.errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="label-base">Dirección</label>
            <input
              type="text"
              placeholder="Ciudad, Estado, País"
              className={profileForm.formState.errors.address ? 'input-error' : 'input-base'}
              {...profileForm.register('address')}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continuar <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1"
          >
            Omitir por ahora
          </button>
        </form>
      )}

      {/* Step 2: Services (providers only) */}
      {step === 2 && isProvider && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Agrega los servicios que ofreces. Podrás añadir más después.
          </p>

          {/* Services list */}
          {services.length > 0 && (
            <div className="space-y-2">
              {services.map((svc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{svc.name}</p>
                    <p className="text-xs text-gray-500">
                      {svc.duration_minutes} min · ${svc.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(idx)}
                    className="text-error-400 hover:text-error-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add service form */}
          {showServiceForm ? (
            <form onSubmit={serviceForm.handleSubmit(handleAddService)} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="label-base">Nombre del servicio</label>
                <input
                  type="text"
                  placeholder="Ej: Consulta médica, Corte de cabello..."
                  className={serviceForm.formState.errors.name ? 'input-error' : 'input-base'}
                  {...serviceForm.register('name')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">Duración (min)</label>
                  <input
                    type="number"
                    className={serviceForm.formState.errors.duration_minutes ? 'input-error' : 'input-base'}
                    {...serviceForm.register('duration_minutes', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="label-base">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={serviceForm.formState.errors.price ? 'input-error' : 'input-base'}
                    {...serviceForm.register('price', { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div>
                <label className="label-base">Descripción (opcional)</label>
                <textarea
                  rows={2}
                  className="input-base resize-none"
                  {...serviceForm.register('description')}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-1 py-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Agregar'}
                </button>
                <button type="button" onClick={() => setShowServiceForm(false)} className="btn-ghost flex-1 py-2">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowServiceForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar servicio
            </button>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-ghost flex items-center gap-1 px-4 py-2.5"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {(step === 3 || (step === 2 && !isProvider)) && (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">¡Perfil completado!</h3>
            <p className="text-gray-500 mt-1">Tu cuenta está lista para usar.</p>
          </div>
          <button onClick={handleFinish} className="btn-primary px-8 py-3">
            Ir al Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
