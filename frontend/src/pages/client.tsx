import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import es from 'date-fns/locale/es/index.js';
import {
  Calendar, Clock, MapPin, Phone, LogOut, Plus, ChevronRight, Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { clientService } from '@/services/clientService';
import { useAuth } from '@/hooks/useAuth';
import { APPOINTMENT_STATUSES } from '@/utils/constants';

export default function ClientPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { data: ctx, isLoading } = useQuery({
    queryKey: ['client-context'],
    queryFn: () => clientService.getMyProvider(),
  });

  const { data: appointments = [], isLoading: aptLoading } = useQuery({
    queryKey: ['client-appointments'],
    queryFn: () => clientService.getMyAppointments(),
  });

  const provider = ctx?.provider;
  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.start_time) >= now);
  const past = appointments.filter((a) => new Date(a.start_time) < now);

  const handleNewBooking = () => {
    if (provider?.id) {
      navigate(`/book?p=${provider.id}`);
    } else {
      navigate('/book');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-gray-100 flex items-center justify-center bg-white shrink-0">
            {provider?.logo_url ? (
              <img src={provider.logo_url} alt={provider.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <span className="font-semibold text-gray-900 text-sm truncate flex-1">
            {provider?.full_name || ctx?.app_name || 'Mi cuenta'}
          </span>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user?.full_name?.split(' ')[0] || ''}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {provider
              ? `Aquí están tus citas con ${provider.full_name}`
              : 'No tienes proveedor asignado todavía'}
          </p>
        </div>

        {/* Provider info card */}
        {provider && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1.5">
            <p className="font-semibold text-gray-900">{provider.full_name}</p>
            {provider.address && (
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{provider.address}</span>
              </p>
            )}
            {provider.phone && (
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{provider.phone}</span>
              </p>
            )}
          </div>
        )}

        {/* New booking CTA */}
        <button
          onClick={handleNewBooking}
          className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Reservar nueva cita
        </button>

        {/* Upcoming appointments */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">Próximas citas</h2>
          {aptLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
              No tienes citas próximas
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))}
            </div>
          )}
        </section>

        {/* Past appointments */}
        {past.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">Historial</h2>
            <div className="space-y-2">
              {past.slice(0, 5).map((a) => (
                <AppointmentCard key={a.id} appointment={a} dim />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment: a,
  dim = false,
}: {
  appointment: import('@/services/clientService').ClientAppointment;
  dim?: boolean;
}) {
  const status = APPOINTMENT_STATUSES[a.status];
  const start = new Date(a.start_time);

  return (
    <div
      className={clsx(
        'bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm',
        dim && 'opacity-70'
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex flex-col items-center justify-center shrink-0">
        <span className="text-[10px] font-medium uppercase">
          {format(start, 'MMM', { locale: es })}
        </span>
        <span className="text-base font-bold leading-none">{format(start, 'd')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{a.service.name}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" />
          {format(start, "EEEE d 'de' MMM · HH:mm", { locale: es })}
        </p>
        {a.staff && (
          <p className="text-xs text-gray-400 mt-0.5">Con {a.staff.name}</p>
        )}
      </div>
      <span
        className={clsx(
          'shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full',
          status.bgColor,
          status.textColor
        )}
      >
        {status.label}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </div>
  );
}
