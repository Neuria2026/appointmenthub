import { useState, useRef } from 'react';
import {
  Camera, Mail, Phone, MapPin, Briefcase, Trash2, Plus,
  Pencil, Clock, DollarSign, Users, Upload, X, Check, Building2,
} from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { BottomNavigation } from '@/components/common/Navigation';
import { ProfileSetup } from '@/components/Auth/ProfileSetup';
import { ServiceModal } from '@/components/Provider/ServiceModal';
import { StaffModal } from '@/components/Provider/StaffModal';
import { useAuthStore } from '@/store/store';
import { getInitials } from '@/utils/formatters';
import { DEFAULT_AVATAR } from '@/utils/constants';
import { formatPhone } from '@/utils/formatters';
import { serviceApi, staffApi, uploadLogo } from '@/services/providerService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Service, Staff, ServiceFormData, StaffFormData } from '@/types';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [serviceModal, setServiceModal] = useState<{ open: boolean; service?: Service | null }>({ open: false });
  const [staffModal, setStaffModal] = useState<{ open: boolean; member?: Staff | null }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'service' | 'staff'; id: string } | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const isProvider = user.role === 'provider';

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['provider-services', user.id],
    queryFn: () => serviceApi.list(user.id),
    enabled: isProvider,
  });

  const { data: staffList = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffApi.list(),
    enabled: isProvider,
  });

  // ── Service mutations ──────────────────────────────────────

  const createService = useMutation({
    mutationFn: async ({ data, staffIds }: { data: ServiceFormData; staffIds: string[] }) => {
      const svc = await serviceApi.create(data);
      if (staffIds.length > 0) await serviceApi.setStaff(svc.id, staffIds);
      return svc;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-services'] }),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, data, staffIds }: { id: string; data: ServiceFormData; staffIds: string[] }) => {
      await serviceApi.update(id, data);
      await serviceApi.setStaff(id, staffIds);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-services'] }),
  });

  const deleteService = useMutation({
    mutationFn: (id: string) => serviceApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-services'] });
      setDeleteConfirm(null);
    },
  });

  // ── Staff mutations ────────────────────────────────────────

  const createStaff = useMutation({
    mutationFn: (data: StaffFormData) => staffApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });

  const updateStaff = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffFormData }) => staffApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });

  const deleteStaffMember = useMutation({
    mutationFn: (id: string) => staffApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
      setDeleteConfirm(null);
    },
  });

  // ── Logo upload ────────────────────────────────────────────

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2MB');
      return;
    }
    setLogoUploading(true);
    try {
      const logoUrl = await uploadLogo(user.id, file);
      setUser({ ...user, logo_url: logoUrl });
    } catch {
      alert('Error al subir el logo');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const removeLogo = async () => {
    try {
      const token = localStorage.getItem('appointmenthub_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ logo_url: null }),
      });
      if (res.ok) setUser({ ...user, logo_url: undefined });
    } catch { /* silent */ }
  };

  const avatarUrl = user.profile_picture_url
    ? user.profile_picture_url
    : `${DEFAULT_AVATAR}${encodeURIComponent(user.full_name)}`;

  const formatDuration = (min: number) =>
    min < 60 ? `${min}min` : `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ''}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex h-[calc(100vh-4rem)] sticky top-16">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="page-container pb-20 md:pb-8">
            <h1 className="section-title">Mi Perfil</h1>

            {isEditing ? (
              <div className="max-w-lg">
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-gray-900">Editar Perfil</h2>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                  <ProfileSetup onDone={() => setIsEditing(false)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Profile card */}
                  <div className="card text-center">
                    <div className="relative inline-block mb-4">
                      <img
                        src={avatarUrl}
                        alt={user.full_name}
                        className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-primary-100"
                      />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{user.full_name}</h2>
                    <span className="badge badge-primary mt-1 capitalize">
                      {user.role === 'provider' ? 'Proveedor' : 'Cliente'}
                    </span>
                    <div className="mt-4 space-y-2 text-sm text-gray-600 text-left">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{formatPhone(user.phone)}</span>
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{user.address}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-outline w-full mt-5 text-sm py-2"
                    >
                      Editar perfil
                    </button>
                  </div>

                  {/* Logo card (providers only) */}
                  {isProvider && (
                    <div className="card">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary-500" />
                        Logo del negocio
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Aparece en la cabecera de la plataforma en lugar del logo por defecto.
                      </p>

                      {user.logo_url ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-full h-20 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center p-3">
                            <img
                              src={user.logo_url}
                              alt="Logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => logoInputRef.current?.click()}
                              disabled={logoUploading}
                              className="btn-outline flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Cambiar
                            </button>
                            <button
                              onClick={removeLogo}
                              className="p-1.5 text-error-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                          className="w-full border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:text-primary-500 transition-all"
                        >
                          {logoUploading ? (
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Camera className="w-8 h-8" />
                          )}
                          <span className="text-xs font-medium">
                            {logoUploading ? 'Subiendo...' : 'Subir logo'}
                          </span>
                          <span className="text-xs">PNG, JPG · Máx. 2MB</span>
                        </button>
                      )}

                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Account info */}
                  <div className="card">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Información de cuenta</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Nombre completo', value: user.full_name },
                        { label: 'Email', value: user.email },
                        { label: 'Teléfono', value: user.phone ? formatPhone(user.phone) : '—' },
                        { label: 'Dirección', value: user.address || '—' },
                        { label: 'Tipo de cuenta', value: user.role === 'provider' ? 'Proveedor' : 'Cliente' },
                        { label: 'Miembro desde', value: new Date(user.created_at).toLocaleDateString('es', { month: 'long', year: 'numeric' }) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Services (providers) ───────────────── */}
                  {isProvider && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-primary-500" />
                          Mis Servicios
                          {services.length > 0 && (
                            <span className="ml-1 text-xs font-normal text-gray-400">({services.length})</span>
                          )}
                        </h3>
                        <button
                          onClick={() => setServiceModal({ open: true, service: null })}
                          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Nuevo servicio
                        </button>
                      </div>

                      {servicesLoading ? (
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                          ))}
                        </div>
                      ) : services.length === 0 ? (
                        <div className="text-center py-8">
                          <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Aún no tienes servicios</p>
                          <p className="text-xs text-gray-300 mt-1">Añade tu primer servicio para empezar a recibir citas</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {services.map((svc) => (
                            <div
                              key={svc.id}
                              className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
                            >
                              <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4 text-primary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">{svc.name}</p>
                                  {!svc.is_active && (
                                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Inactivo</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(svc.duration_minutes)}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {Number(svc.price).toFixed(2)}€
                                  </span>
                                  {svc.staff && svc.staff.length > 0 && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {svc.staff.length} trabajador{svc.staff.length !== 1 ? 'es' : ''}
                                    </span>
                                  )}
                                </div>
                                {svc.description && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate">{svc.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => setServiceModal({ open: true, service: svc })}
                                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'service', id: svc.id })}
                                  className="p-1.5 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Staff (providers) ─────────────────── */}
                  {isProvider && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary-500" />
                          Equipo / Trabajadores
                          {staffList.length > 0 && (
                            <span className="ml-1 text-xs font-normal text-gray-400">({staffList.length})</span>
                          )}
                        </h3>
                        <button
                          onClick={() => setStaffModal({ open: true, member: null })}
                          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Añadir
                        </button>
                      </div>

                      {staffLoading ? (
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                          ))}
                        </div>
                      ) : staffList.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Sin trabajadores registrados</p>
                          <p className="text-xs text-gray-300 mt-1">Añade tu equipo para asignarlos a servicios</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {staffList.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
                            >
                              <div className="w-9 h-9 bg-secondary-100 rounded-full flex items-center justify-center shrink-0 text-secondary-700 font-semibold text-sm">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                  {!member.is_active && (
                                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Inactivo</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {member.specialty && (
                                    <span className="text-xs text-gray-500">{member.specialty}</span>
                                  )}
                                  {member.service_ids?.length > 0 && (
                                    <span className="text-xs text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded">
                                      {member.service_ids.length} servicio{member.service_ids.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => setStaffModal({ open: true, member })}
                                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'staff', id: member.id })}
                                  className="p-1.5 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Danger zone */}
                  <div className="card border border-error-200">
                    <h3 className="text-sm font-semibold text-error-600 mb-3 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Zona de peligro
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Eliminar tu cuenta es una acción permanente e irreversible.
                    </p>
                    <button className="text-xs text-error-500 hover:text-error-600 font-medium underline">
                      Eliminar mi cuenta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNavigation />

      {/* ── Service Modal ────────────────────────────────── */}
      {serviceModal.open && (
        <ServiceModal
          service={serviceModal.service}
          staff={staffList}
          onSave={async (data, staffIds) => {
            if (serviceModal.service) {
              await updateService.mutateAsync({ id: serviceModal.service.id, data, staffIds });
            } else {
              await createService.mutateAsync({ data, staffIds });
            }
          }}
          onClose={() => setServiceModal({ open: false })}
        />
      )}

      {/* ── Staff Modal ──────────────────────────────────── */}
      {staffModal.open && (
        <StaffModal
          member={staffModal.member}
          onSave={async (data) => {
            if (staffModal.member) {
              await updateStaff.mutateAsync({ id: staffModal.member.id, data });
            } else {
              await createStaff.mutateAsync(data);
            }
          }}
          onClose={() => setStaffModal({ open: false })}
        />
      )}

      {/* ── Delete Confirmation ──────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              ¿Eliminar {deleteConfirm.type === 'service' ? 'servicio' : 'trabajador'}?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'service') {
                    deleteService.mutate(deleteConfirm.id);
                  } else {
                    deleteStaffMember.mutate(deleteConfirm.id);
                  }
                }}
                className="flex-1 bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
