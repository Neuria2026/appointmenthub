import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Clock, DollarSign, ChevronLeft, ChevronRight, Calendar,
  User, Check, ArrowLeft, Loader2, Mail, Phone, FileText, Briefcase,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isBefore, startOfDay,
  startOfWeek, endOfWeek, isSameMonth,
} from 'date-fns';
import es from 'date-fns/locale/es/index.js';
import { bookingService, type PublicService, type BookingResult } from '@/services/bookingService';

type Step = 'service' | 'staff' | 'date' | 'time' | 'info' | 'done';

const STEPS: Step[] = ['service', 'staff', 'date', 'time', 'info', 'done'];
const STEP_LABELS: Record<Step, string> = {
  service: 'Servicio',
  staff: 'Trabajador',
  date: 'Fecha',
  time: 'Hora',
  info: 'Tus datos',
  done: 'Confirmado',
};

export default function BookPage() {
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

  // ── Data fetching ─────────────────────────────────────────
  const { data: info } = useQuery({
    queryKey: ['public-info'],
    queryFn: bookingService.getInfo,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['public-services'],
    queryFn: bookingService.getServices,
  });

  const { data: slots = [], isFetching: slotsLoading } = useQuery({
    queryKey: ['public-slots', selected.service?.id, selected.date?.toISOString(), selected.staffId],
    queryFn: () =>
      bookingService.getAvailability(
        selected.service!.id,
        format(selected.date!, 'yyyy-MM-dd'),
        selected.staffId
      ),
    enabled: step === 'time' && !!selected.service && !!selected.date,
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
    setSelected({ service: svc, staffId: undefined as any, date: null, slot: null });
    // Skip staff step if service has no staff assigned
    goto(svc.staff.length > 0 ? 'staff' : 'date');
  };

  const handleSelectStaff = (staffId: string | null) => {
    setSelected((s) => ({ ...s, staffId, slot: null }));
    goto('date');
  };

  const handleSelectDate = (d: Date) => {
    setSelected((s) => ({ ...s, date: d, slot: null }));
    goto('time');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* ── Brand Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {info?.logo_url ? (
            <img src={info.logo_url} alt={info.app_name} className="h-8 max-w-[140px] object-contain" />
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">{info?.app_name || 'Reservas'}</span>
            </>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ── Step indicator (hidden on done) ─────────────────── */}
        {step !== 'done' && (
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

        {/* ── STEP 1: Service ──────────────────────────────────── */}
        {step === 'service' && (
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">¿Qué servicio deseas?</h1>
            <p className="text-sm text-gray-500 mb-5">Selecciona el servicio que quieres reservar</p>
            {servicesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No hay servicios disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleSelectService(svc)}
                    className="w-full text-left bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {svc.name}
                        </p>
                        {svc.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{svc.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDuration(svc.duration_minutes)}
                          </span>
                          {Number(svc.price) > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> {Number(svc.price).toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-400 shrink-0 mt-1 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Staff ────────────────────────────────────── */}
        {step === 'staff' && selected.service && (
          <div>
            <button onClick={() => goto('service')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-1">¿Con quién quieres tu cita?</h1>
            <p className="text-sm text-gray-500 mb-5">Elige un trabajador o déjanos asignarte uno</p>
            <div className="space-y-3">
              {/* Any staff option */}
              <button
                onClick={() => handleSelectStaff(null)}
                className="w-full text-left bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md group flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-700">Cualquier trabajador</p>
                  <p className="text-xs text-gray-400">Te asignaremos el primero disponible</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-400 ml-auto shrink-0" />
              </button>

              {selected.service.staff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectStaff(member.id)}
                  className="w-full text-left bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md group flex items-center gap-4"
                >
                  <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center shrink-0 text-primary-700 font-bold text-base">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-700">{member.name}</p>
                    {member.specialty && (
                      <p className="text-xs text-gray-400">{member.specialty}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-400 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: Date ─────────────────────────────────────── */}
        {step === 'date' && (
          <div>
            <button
              onClick={() => goto(selected.service?.staff && selected.service.staff.length > 0 ? 'staff' : 'service')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-1">¿Cuándo quieres tu cita?</h1>
            <p className="text-sm text-gray-500 mb-5">Selecciona una fecha disponible</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {/* Month navigation */}
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

              {/* Day names */}
              <div className="grid grid-cols-7 mb-1">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                  <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
              </div>

              {/* Days */}
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
        )}

        {/* ── STEP 4: Time ─────────────────────────────────────── */}
        {step === 'time' && selected.date && (
          <div>
            <button onClick={() => goto('date')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-1">¿A qué hora?</h1>
            <p className="text-sm text-gray-500 mb-1 capitalize">
              {format(selected.date, "EEEE, d 'de' MMMM", { locale: es })}
            </p>
            {selected.service && (
              <p className="text-xs text-gray-400 mb-5">
                {selected.service.name} · {formatDuration(selected.service.duration_minutes)}
              </p>
            )}

            {slotsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No hay horarios para este día</p>
                <button onClick={() => goto('date')} className="mt-3 text-sm text-primary-600 hover:underline">
                  Elegir otra fecha
                </button>
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
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">Todos los horarios están ocupados</p>
                    <button onClick={() => goto('date')} className="mt-2 text-sm text-primary-600 hover:underline">
                      Elegir otra fecha
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STEP 5: Info form ────────────────────────────────── */}
        {step === 'info' && (
          <div>
            <button onClick={() => goto('time')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
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
  );
}
