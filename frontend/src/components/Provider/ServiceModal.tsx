import { useState, useEffect } from 'react';
import { X, Clock, DollarSign, FileText, Briefcase, Users } from 'lucide-react';
import type { Service, ServiceFormData, Staff } from '@/types';

interface Props {
  service?: Service | null;
  staff: Staff[];
  onSave: (data: ServiceFormData, staffIds: string[]) => Promise<void>;
  onClose: () => void;
}

export function ServiceModal({ service, staff, onSave, onClose }: Props) {
  const [form, setForm] = useState<ServiceFormData>({
    name: service?.name ?? '',
    duration_minutes: service?.duration_minutes ?? 30,
    price: service?.price ?? 0,
    description: service?.description ?? '',
  });
  const [selectedStaff, setSelectedStaff] = useState<string[]>(
    service?.staff?.map((s) => s.id) ?? []
  );
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
      await onSave(form, selectedStaff);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleStaff = (id: string) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const durations = [15, 20, 30, 45, 60, 90, 120];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary-500" />
            {service ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Nombre del servicio *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Corte de cabello"
              className="input w-full"
              autoFocus
            />
          </div>

          {/* Duration + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> Duración
              </label>
              <select
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                className="input w-full"
              >
                {durations.map((d) => (
                  <option key={d} value={d}>
                    {d < 60 ? `${d} min` : `${d / 60}h${d % 60 ? ` ${d % 60}min` : ''}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Precio (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="input w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-400" /> Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe brevemente el servicio..."
              rows={3}
              className="input w-full resize-none"
            />
          </div>

          {/* Staff assignment */}
          {staff.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-400" /> Trabajadores que realizan este servicio
              </label>
              <div className="space-y-2">
                {staff.filter((s) => s.is_active).map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(member.id)}
                      onChange={() => toggleStaff(member.id)}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      {member.specialty && (
                        <p className="text-xs text-gray-400">{member.specialty}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-error-600 bg-error-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : service ? 'Guardar cambios' : 'Crear servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
