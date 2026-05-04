import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calendarService } from '@/services/calendarService';
import type { Appointment } from '@/types';
import { toISODate } from '@/utils/dateUtils';

export function useCalendar(appointments: Appointment[] = []) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const syncStatusQuery = useQuery({
    queryKey: ['calendar-sync-status'],
    queryFn: calendarService.getSyncStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback(
    (date: Date): Appointment[] => {
      const dateStr = toISODate(date);
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.start_time);
        return toISODate(aptDate) === dateStr;
      });
    },
    [appointments]
  );

  // Get appointments for the current month
  const getAppointmentsForMonth = useCallback(
    (year: number, month: number): Map<string, Appointment[]> => {
      const map = new Map<string, Appointment[]>();
      appointments.forEach((apt) => {
        const aptDate = new Date(apt.start_time);
        if (aptDate.getFullYear() === year && aptDate.getMonth() === month) {
          const key = toISODate(aptDate);
          const existing = map.get(key) || [];
          map.set(key, [...existing, apt]);
        }
      });
      return map;
    },
    [appointments]
  );

  const selectedDateAppointments = selectedDate
    ? getAppointmentsForDate(selectedDate)
    : [];

  return {
    currentDate,
    selectedDate,
    selectedDateAppointments,
    syncStatus: syncStatusQuery.data,
    isSyncLoading: syncStatusQuery.isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    getAppointmentsForDate,
    getAppointmentsForMonth,
  };
}
