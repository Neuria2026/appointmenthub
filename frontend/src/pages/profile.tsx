import { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Briefcase, Trash2, Plus } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { BottomNavigation } from '@/components/common/Navigation';
import { ProfileSetup } from '@/components/Auth/ProfileSetup';
import { useAuthStore } from '@/store/store';
import { getInitials } from '@/utils/formatters';
import { DEFAULT_AVATAR } from '@/utils/constants';
import { formatPhone } from '@/utils/formatters';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const avatarUrl = user.profile_picture_url
    ? user.profile_picture_url
    : `${DEFAULT_AVATAR}${encodeURIComponent(user.full_name)}`;

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
                  <ProfileSetup />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile card */}
                <div className="lg:col-span-1">
                  <div className="card text-center">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                      <img
                        src={avatarUrl}
                        alt={user.full_name}
                        className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-primary-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold opacity-0 hover:opacity-100 transition-opacity cursor-pointer mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">{user.full_name}</h2>
                    <span className="badge badge-primary mt-1 capitalize">
                      {user.role === 'provider' ? 'Proveedor' : 'Cliente'}
                    </span>

                    <div className="mt-4 space-y-2 text-sm text-gray-600 text-left">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{formatPhone(user.phone)}</span>
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
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
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-4">
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

                  {/* Services (providers) */}
                  {user.role === 'provider' && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-primary-500" />
                          Mis Servicios
                        </h3>
                        <button className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
                          <Plus className="w-3.5 h-3.5" />
                          Agregar
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Administra tus servicios desde aquí. Puedes agregar, editar o eliminar.
                      </p>
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
    </div>
  );
}
