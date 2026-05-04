import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { appointmentService } from '@/services/appointmentService';
import type { AppointmentFilters, Appointment } from '@/types';
import { QUERY_KEYS } from '@/utils/constants';

export function useAppointments(filters?: AppointmentFilters) {
  const queryClient = useQueryClient();

  const appointmentsQuery = useQuery({
    queryKey: [QUERY_KEYS.appointments, filters],
    queryFn: () => appointmentService.getAppointments(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Appointment>) => appointmentService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      toast.success('Cita creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la cita');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      appointmentService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      toast.success('Cita actualizada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar la cita');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => appointmentService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      toast.success('Cita eliminada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar la cita');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentService.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      toast.success('Cita cancelada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cancelar la cita');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => appointmentService.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      toast.success('Cita marcada como completada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al completar la cita');
    },
  });

  return {
    appointments: appointmentsQuery.data?.data ?? [],
    total: appointmentsQuery.data?.total ?? 0,
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    refetch: appointmentsQuery.refetch,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    cancel: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    complete: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.appointment(id),
    queryFn: () => appointmentService.getAppointment(id),
    enabled: !!id,
  });
}

export function useAvailability(serviceId: string, date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.availability(serviceId, date),
    queryFn: () => appointmentService.getAvailability(serviceId, date),
    enabled: !!serviceId && !!date,
  });
}
