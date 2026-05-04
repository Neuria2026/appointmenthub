import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { BottomNavigation } from '@/components/common/Navigation';
import { AppointmentList } from '@/components/Appointments/AppointmentList';
import { AppointmentForm } from '@/components/Appointments/AppointmentForm';
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import { RescheduleModal } from '@/components/Appointments/RescheduleModal';
import { useAppointments } from '@/hooks/useAppointments';
import type { Appointment, AppointmentStatus } from '@/types';

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  const { appointments, isLoading, total, cancel, complete } = useAppointments({
    status: statusFilter,
    page,
    limit: 10,
  });

  const handleView = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowDetails(true);
  };

  const handleReschedule = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowDetails(false);
    setShowReschedule(true);
  };

  const handleCancel = async (apt: Appointment) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    await cancel({ id: apt.id });
    setShowDetails(false);
  };

  const handleComplete = async (apt: Appointment) => {
    await complete(apt.id);
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex h-[calc(100vh-4rem)] sticky top-16">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="page-container pb-20 md:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="section-title mb-0">Mis Citas</h1>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 text-sm py-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Cita
              </button>
            </div>

            <AppointmentList
              appointments={appointments}
              isLoading={isLoading}
              total={total}
              page={page}
              onPageChange={setPage}
              onStatusFilter={setStatusFilter}
              onView={handleView}
              onReschedule={handleReschedule}
              onCancel={handleCancel}
              onComplete={handleComplete}
            />
          </div>
        </main>
      </div>

      {/* New Appointment Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Cita</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <AppointmentForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setShowDetails(false)}
          onReschedule={() => handleReschedule(selectedAppointment)}
          onCancel={() => handleCancel(selectedAppointment)}
          onComplete={() => handleComplete(selectedAppointment)}
        />
      )}

      {/* Reschedule Modal */}
      {showReschedule && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onSuccess={() => setShowReschedule(false)}
          onClose={() => setShowReschedule(false)}
        />
      )}

      <BottomNavigation />
    </div>
  );
}
