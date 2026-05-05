import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageCircle, Send, Mail, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { notificationPreferencesSchema, type NotificationPreferencesFormValues } from '@/utils/validators';
import { useNotifications } from '@/hooks/useNotifications';
import { NOTIFICATION_CHANNELS, REMINDER_TIMES, TELEGRAM_BOT_USERNAME } from '@/utils/constants';
import type { NotificationChannel, ReminderTime } from '@/types';

export function ReminderSettings() {
  const { preferences, isLoadingPreferences, updatePreferences, isUpdating } = useNotifications();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<NotificationPreferencesFormValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      channels: [],
      reminder_times: [],
      phone_whatsapp: '',
      telegram_id: '',
    },
  });

  useEffect(() => {
    if (preferences) {
      reset({
        channels: preferences.channels || [],
        reminder_times: preferences.reminder_times || [],
        phone_whatsapp: preferences.phone_whatsapp || '',
        telegram_id: preferences.telegram_id || '',
      });
    }
  }, [preferences, reset]);

  const selectedChannels = watch('channels') || [];

  const onSubmit = async (data: NotificationPreferencesFormValues) => {
    await updatePreferences(data);
  };

  const channelIcons = {
    whatsapp: MessageCircle,
    telegram: Send,
    email: Mail,
  };

  if (isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Notification Channels */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" />
          Canales de Notificación
        </h3>
        <div className="space-y-2">
          <Controller
            name="channels"
            control={control}
            render={({ field }) => (
              <>
                {(Object.keys(NOTIFICATION_CHANNELS) as NotificationChannel[]).map((channel) => {
                  const { label } = NOTIFICATION_CHANNELS[channel];
                  const Icon = channelIcons[channel];
                  const isChecked = field.value?.includes(channel) ?? false;

                  return (
                    <label
                      key={channel}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                        isChecked
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...(field.value || []), channel]
                            : (field.value || []).filter((c) => c !== channel);
                          field.onChange(newValue);
                        }}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <Icon className={clsx('w-4 h-4', isChecked ? 'text-primary-500' : 'text-gray-400')} />
                      <span className={clsx('text-sm font-medium', isChecked ? 'text-primary-700' : 'text-gray-700')}>
                        {label}
                      </span>
                    </label>
                  );
                })}
              </>
            )}
          />
        </div>
      </div>

      {/* WhatsApp phone */}
      {selectedChannels.includes('whatsapp') && (
        <div className="animate-fade-in">
          <label className="label-base">Número de WhatsApp</label>
          <input
            type="tel"
            placeholder="+52 55 1234 5678"
            className={errors.phone_whatsapp ? 'input-error' : 'input-base'}
            {...register('phone_whatsapp')}
          />
          {errors.phone_whatsapp && (
            <p className="error-text">{errors.phone_whatsapp.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Incluye el código de país</p>
        </div>
      )}

      {/* Telegram ID */}
      {selectedChannels.includes('telegram') && (
        <div className="animate-fade-in">
          <label className="label-base">ID de Telegram</label>
          <input
            type="text"
            placeholder="@tu_usuario_telegram"
            className={errors.telegram_id ? 'input-error' : 'input-base'}
            {...register('telegram_id')}
          />
          {errors.telegram_id && <p className="error-text">{errors.telegram_id.message}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Escribe <span className="font-mono">/start</span> al bot @{TELEGRAM_BOT_USERNAME}
          </p>
        </div>
      )}

      {/* Reminder Times */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tiempo de Recordatorio</h3>
        <p className="text-xs text-gray-500 mb-3">Cuándo antes de la cita quieres recibir el recordatorio</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Controller
            name="reminder_times"
            control={control}
            render={({ field }) => (
              <>
                {REMINDER_TIMES.map(({ value, label }) => {
                  const isChecked = field.value?.includes(value) ?? false;

                  return (
                    <label
                      key={value}
                      className={clsx(
                        'flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all',
                        isChecked
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...(field.value || []), value as ReminderTime]
                            : (field.value || []).filter((t) => t !== value);
                          field.onChange(newValue);
                        }}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span
                        className={clsx(
                          'text-sm',
                          isChecked ? 'text-primary-700 font-medium' : 'text-gray-600'
                        )}
                      >
                        {label}
                      </span>
                    </label>
                  );
                })}
              </>
            )}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isUpdating}
          className="btn-primary flex items-center gap-2 py-2.5 px-6"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Preferencias'
          )}
        </button>
      </div>
    </form>
  );
}
