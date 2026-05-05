import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Clock, ChevronLeft, ChevronRight, Calendar,
  User, Check, ArrowLeft, Loader2, Mail, Phone, FileText, Briefcase, MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isBefore, startOfDay,
  startOfWeek, endOfWeek, isSameMonth,
} from 'date-fns';
import es from 'date-fns/locale/es/index.js';
import { bookingService, type PublicService, type BookingResult } from '@/services/bookingService';

type Step = 'service' | 'booking' | 'info' | 'done';

const STEPS: Step[] = ['service', 'booking', 'info', 'done'];
const STEP_LABELS: Record<Step, string> = {
  service: 'Servicio',
  booking: 'Cita',
  info: 'Tus datos',
  done: 'Confirmado',
};

export default function BookPage() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('p') || undefined;
  const [step, setStep] = useState<Step>('service');
  const [selected, setSelected] = useState<{
    service: PublicService | null;
    staffId: string | null; // null = any
    date: Date | null;
    slot: { start: string; end: string; time: string } | null;
  }>({ service: null, staffId: undefined as any, date: null, slot: null });
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [confirmation, setConfirmation] = useState<BookingResult | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ─────────────────────────────────────────
  const { data: info } = useQuery({
    queryKey: ['public-info', providerId],
    queryFn: () => bookingService.getInfo(providerId),
  });

  const { data: services = [], isLoading: servicesLoading, isError: servicesError } = useQuery({
    queryKey: ['public-services', providerId],
    queryFn: () => bookingService.getServices(providerId),
  });

  const { data: slots = [], isFetching: slotsLoading } = useQuery({
    queryKey: ['public-slots', selected.service?.id, selected.date?.toISOString(), selected.staffId],
    queryFn: () =>
      bookingService.getAvailability(
        selected.service!.id,
        format(selected.date!, 'yyyy-MM-dd'),
        selected.staffId
      ),
    enabled: step === 'booking' && !!selected.service && !!selected.date,
  });

  const bookMutation = useMutation({
    mutationFn: bookingService.book,
    onSuccess: (data) => {
      setConfirmation(data);
      setStep('done');
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || 'Error al confirmar la cita');
    },
  });

  // ── Helpers ───────────────────────────────────────────────
  const goto = (s: Step) => setStep(s);

  const handleSelectService = (svc: PublicService) => {
    setSelected({
      service: svc,
      staffId: svc.staff.length > 0 ? (undefined as any) : null,
      date: null,
      slot: null,
    });
    goto('booking');
  };

  const handleSelectStaff = (staffId: string | null) => {
    setSelected((s) => ({ ...s, staffId, slot: null }));
    requestAnimationFrame(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSelectDate = (d: Date) => {
    setSelected((s) => ({ ...s, date: d, slot: null }));
  };

  // Scroll to slots when a date is picked (after the slots section renders)
  useEffect(() => {
    if (step === 'booking' && selected.date) {
      const t = setTimeout(() => {
        slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [selected.date, step]);

  const handleSelectSlot = (slot: { start: string; end: string; time: string }) => {
    setSelected((s) => ({ ...s, slot }));
    goto('info');
  };

  const handleBook = () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('El nombre es obligatorio'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setFormError('Email inválido'); return; }
    bookMutation.mutate({
      service_id: selected.service!.id,
      staff_id: selected.staffId || null,
      start_time: selected.slot!.start,
      end_time: selected.slot!.end,
      client_name: form.name.trim(),
      client_email: form.email.trim(),
      client_phone: form.phone.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const stepIndex = STEPS.indexOf(step);
  const displaySteps = STEPS.slice(0, -1); // all except 'done'

  // ── Calendar logic ────────────────────────────────────────
  const calendarDays = (() => {
    const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  })();

  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 3);

  const formatDuration = (min: number) =>
    min < 60 ? `${min}min` : `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ''}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Header ───────────────────────────────────────── */}
      {step === 'service' ? (
        <header className="bg-white border-b border-gray-100">
          <div className="h-28 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500" />
          <div className="max-w-2xl mx-auto px-4 pb-5 -mt-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow ring-1 ring-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {info?.logo_url ? (
                  <img src={info.logo_url} alt={info.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
                  {info?.full_name || info?.app_name || 'Reservas'}
                </h1>
                <div className="mt-1.5 space-y-1">
                  {info?.address && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{info.address}</span>
                    </p>
                  )}
                  {info?.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{info.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-gray-100 flex items-center justify-center overflow-hidden">
              {info?.logo_url ? (
                <img src={info.logo_url} alt={info.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <span className="font-semibold text-gray-900 text-sm truncate">
              {info?.full_name || info?.app_name || 'Reservas'}
            </span>
          </div>
        </header>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {/* ── Step indicator (hidden on service & done) ────────── */}
        {step !== 'done' && step !== 'service' && (
          <div className="mb-6">
            <div className="flex items-center gap-0">
              {displaySteps.map((s, i) => {
                const idx = displaySteps.indexOf(s);
                const current = displaySteps.indexOf(step);
                const done = idx < current;
                const active = idx === current;
                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                          done && 'bg-primary-500 text-white',
                          active && 'bg-primary-500 text-white ring-4 ring-primary-100',
                          !done && !active && 'bg-gray-200 text-gray-500'
                        )}
                      >
                        {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className={clsx(
                        'text-xs hidden sm:block',
                        active ? 'text-primary-600 font-medium' : 'text-gray-400'
                      )}>
                        {STEP_LABELS[s]}
                      </span>
                    </div>
                    {i < displaySteps.length - 1 && (
                      <div className={clsx(
                        'flex-1 h-0.5 mx-1 -mt-4 sm:-mt-5',
                        idx < current ? 'bg-primary-400' : 'bg-gray-200'
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div key={step} className="animate-slide-up">

        {/* ── STEP 1: Service ──────────────────────────────────── */}
        {step === 'service' && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3 px-1">Servicios</h2>
            {servicesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : servicesError ? (
              <div className="text-center py-12 text-error-400 bg-white rounded-2xl border border-gray-100">
                <p className="font-medium">No se pudieron cargar los servicios</p>
                <p className="text-xs mt-1 text-gray-400">Comprueba que el enlace es correcto</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No hay servicios disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 leading-snug">{svc.name}</p>
                      {svc.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{svc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDuration(svc.duration_minutes)}
                        </span>
                        {Number(svc.price) > 0 && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="font-semibold text-gray-900">
                              {Number(svc.price).toFixed(2)}€
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectService(svc)}
                      className="shrink-0 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                      Reservar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Booking (staff + date + time) ────────────── */}
        {step === 'booking' && selected.service && (
          <div className="space-y-6">
            <div>
              <button onClick={() => goto('service')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Reserva tu cita</h1>
              <p className="text-sm text-gray-500">
                {selected.service.name} · {formatDuration(selected.service.duration_minutes)}
              </p>
            </div>

            {/* Staff selector */}
            {selected.service.staff.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Trabajador</h2>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                  <button
                    onClick={() => handleSelectStaff(null)}
                    className={clsx(
                      'shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm',
                      selected.staffId === null
                        ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                    )}
                  >
                    <div className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center',
                      selected.staffId === null ? 'bg-white/20' : 'bg-gray-100'
                    )}>
                      <User className={clsx('w-3.5 h-3.5', selected.staffId === null ? 'text-white' : 'text-gray-400')} />
                    </div>
                    <span className="font-medium">Cualquiera</span>
                  </button>
                  {selected.service.staff.map((member) => {
                    const active = selected.staffId === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleSelectStaff(member.id)}
                        className={clsx(
                          'shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm',
                          active
                            ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                        )}
                      >
                        <div className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs',
                          active ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
                        )}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-medium leading-tight">{member.name}</p>
                          {member.specialty && (
                            <p className={clsx('text-[10px] leading-tight', active ? 'text-white/80' : 'text-gray-400')}>
                              {member.specialty}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calendar */}
            <div ref={calendarRef} className="scroll-mt-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Fecha</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                    disabled={isSameMonth(calendarMonth, today)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {format(calendarMonth, 'MMMM yyyy', { locale: es })}
                  </span>
                  <button
                    onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                    disabled={!isBefore(calendarMonth, subMonths(maxDate, 2))}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day) => {
                    const inMonth = isSameMonth(day, calendarMonth);
                    const isPast = isBefore(day, today);
                    const isTooFar = !isBefore(day, maxDate);
                    const isSelected = selected.date && isSameDay(day, selected.date);
                    const isDisabled = isPast || isTooFar || !inMonth;
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isDisabled && handleSelectDate(day)}
                        disabled={isDisabled}
                        className={clsx(
                          'aspect-square flex items-center justify-center rounded-xl text-sm transition-all',
                          isSelected && 'bg-primary-500 text-white font-semibold shadow-sm',
                          !isSelected && !isDisabled && 'hover:bg-primary-50 text-gray-900',
                          !isSelected && isDisabled && 'text-gray-300 cursor-default',
                          !isSelected && !isDisabled && isWeekend && 'text-gray-400',
                          !inMonth && 'opacity-0 pointer-events-none'
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time slots */}
            {selected.date && (
              <div ref={slotsRef} className="scroll-mt-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-2 capitalize">
                  Hora · {format(selected.date, "EEEE d 'de' MMMM", { locale: es })}
                </h2>
                {slotsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <p className="text-sm">No hay horarios para este día</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => slot.available && handleSelectSlot(slot)}
                          disabled={!slot.available}
                          className={clsx(
                            'py-2.5 rounded-xl text-sm font-medium transition-all',
                            slot.available
                              ? 'bg-white border border-gray-200 text-gray-800 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 shadow-sm'
                              : 'bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed'
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                    {slots.every((s) => !s.available) && (
                      <p className="mt-3 text-center text-sm text-gray-400">
                        Todos los horarios están ocupados
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: Info form ────────────────────────────────── */}
        {step === 'info' && (
          <div>
            <button onClick={() => goto('booking')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Tus datos</h1>
            <p className="text-sm text-gray-500 mb-5">Te enviaremos la confirmación por email</p>

            {/* Booking summary */}
            {selected.service && selected.date && selected.slot && (
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-5 text-sm">
                <p className="font-semibold text-primary-900">{selected.service.name}</p>
                <p className="text-primary-700 mt-0.5 capitalize">
                  {format(selected.date, "EEEE d 'de' MMMM", { locale: es })} a las {selected.slot.time}
                </p>
                {selected.staffId && selected.service.staff.find((s) => s.id === selected.staffId) && (
                  <p className="text-primary-600 mt-0.5">
                    Con {selected.service.staff.find((s) => s.id === selected.staffId)?.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  className="input w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> Teléfono
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gray-400" /> Notas (opcional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Alguna indicación especial..."
                  rows={2}
                  className="input w-full resize-none"
                />
              </div>

              {formError && (
                <p className="text-sm text-error-600 bg-error-50 px-3 py-2 rounded-xl">{formError}</p>
              )}

              <button
                onClick={handleBook}
                disabled={bookMutation.isPending}
                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
              >
                {bookMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Confirmando...</>
                ) : (
                  <><Check className="w-5 h-5" /> Confirmar reserva</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Done ─────────────────────────────────────── */}
        {step === 'done' && confirmation && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10 text-success-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Cita confirmada!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Hemos enviado los detalles a <strong>{confirmation.client_email}</strong>
            </p>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Servicio</span>
                  <span className="text-sm font-semibold text-gray-900">{confirmation.service.name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Fecha y hora</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {format(new Date(confirmation.start_time), "d MMM yyyy", { locale: es })}
                    {' a las '}
                    {format(new Date(confirmation.start_time), 'HH:mm')}
                  </span>
                </div>
                {confirmation.staff && (
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Trabajador</span>
                    <span className="text-sm font-semibold text-gray-900">{confirmation.staff.name}</span>
                  </div>
                )}
                {Number(confirmation.service.price) > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Precio</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Number(confirmation.service.price).toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setStep('service');
                setSelected({ service: null, staffId: undefined as any, date: null, slot: null });
                setForm({ name: '', email: '', phone: '', notes: '' });
                setConfirmation(null);
              }}
              className="btn-outline px-8"
            >
              Hacer otra reserva
            </button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
