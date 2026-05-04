import { format, parse, addMinutes, isWithinInterval, startOfDay, endOfDay, differenceInDays, isBefore, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeSlot } from '@/types';
import { BUSINESS_HOURS } from './constants';

/**
 * Format a date string or Date object to a human-readable date
 * e.g. "2 de mayo de 2026"
 */
export function formatDate(date: string | Date, pattern = "d 'de' MMMM 'de' yyyy"): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: es });
}

/**
 * Format a date to a short format
 * e.g. "02/05/2026"
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy');
}

/**
 * Format a date to a display format
 * e.g. "Sáb, 2 may"
 */
export function formatDateDisplay(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "EEE, d MMM", { locale: es });
}

/**
 * Format a time string (ISO or Date) to "HH:MM"
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

/**
 * Format a full date and time
 * e.g. "Sábado, 2 de mayo · 14:30"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "EEEE, d 'de' MMMM · HH:mm", { locale: es });
}

/**
 * Format a date to ISO date string "YYYY-MM-DD"
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Generate time slots for a given date and duration
 */
export function getTimeSlots(
  date: Date,
  durationMinutes: number,
  bookedSlots: Array<{ start: string; end: string }> = []
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayStart = new Date(date);
  dayStart.setHours(BUSINESS_HOURS.start, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(BUSINESS_HOURS.end, 0, 0, 0);

  let current = dayStart;

  while (current < dayEnd) {
    const slotEnd = addMinutes(current, durationMinutes);

    if (slotEnd > dayEnd) break;

    const slotStart = new Date(current);
    const available = isSlotAvailable(slotStart, slotEnd, bookedSlots);

    slots.push({
      time: format(slotStart, 'HH:mm'),
      available,
      start: slotStart,
      end: slotEnd,
    });

    current = addMinutes(current, durationMinutes);
  }

  return slots;
}

/**
 * Check if a time slot is available (not overlapping with booked slots)
 */
export function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  bookedSlots: Array<{ start: string; end: string }>
): boolean {
  const now = new Date();
  if (isBefore(slotStart, now)) return false;

  for (const booked of bookedSlots) {
    const bookedStart = parseISO(booked.start);
    const bookedEnd = parseISO(booked.end);

    // Check for overlap
    if (
      isWithinInterval(slotStart, { start: bookedStart, end: bookedEnd }) ||
      isWithinInterval(slotEnd, { start: bookedStart, end: bookedEnd }) ||
      (isBefore(slotStart, bookedStart) && isAfter(slotEnd, bookedEnd))
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Get number of days between two dates
 */
export function getDaysBetween(start: Date | string, end: Date | string): number {
  const a = typeof start === 'string' ? parseISO(start) : start;
  const b = typeof end === 'string' ? parseISO(end) : end;
  return Math.abs(differenceInDays(a, b));
}

/**
 * Get start and end of day for a given date
 */
export function getDayBounds(date: Date): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(d, new Date());
}

/**
 * Get relative time label
 * e.g. "En 2 horas", "Ayer"
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMinutes) < 60) {
    if (diffMinutes < 0) return `Hace ${Math.abs(diffMinutes)} min`;
    if (diffMinutes === 0) return 'Ahora';
    return `En ${diffMinutes} min`;
  }
  if (Math.abs(diffHours) < 24) {
    if (diffHours < 0) return `Hace ${Math.abs(diffHours)} h`;
    return `En ${diffHours} h`;
  }
  if (diffDays === -1) return 'Ayer';
  if (diffDays === 1) return 'Mañana';
  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
  return `En ${diffDays} días`;
}

/**
 * Parse time string "HH:MM" on a given date
 */
export function parseTimeOnDate(date: Date, time: string): Date {
  return parse(time, 'HH:mm', date);
}

/**
 * Get array of month names in Spanish
 */
export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Get array of day names in Spanish
 */
export const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
