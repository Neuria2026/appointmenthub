import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Star } from 'lucide-react';
import type { Staff, StaffFormData } from '@/types';

interface Props {
  member?: Staff | null;
  onSave: (data: StaffFormData) => Promise<void>;
  onClose: () => void;
}

export function StaffModal({ member, onSave, onClose }: Props) {
  const [form, setForm] = useState<StaffFormData>({
    name: member?.name ?? '',
    email: member?.email ?? '',
    phone: member?.phone ?? '',
    specialty: member?.specialty ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-500" />
            {member ? 'Editar trabajador' : 'Nuevo trabajador'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" /> Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre completo"
              className="input w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-gray-400" /> Especialidad
            </label>
            <input
              type="text"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="Ej: Peluquería, Fisioterapia..."
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="trabajador@email.com"
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

          {error && (
            <p className="text-sm text-error-600 bg-error-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : member ? 'Guardar' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
