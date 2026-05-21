import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { showToast } from './Toast';

interface ZoneData {
  zoneId: string;
  name: string;
  nameEn?: string;
  colorHex: string;
  areaSqm: number;
}

interface ZoneEditorProps {
  zone: ZoneData | null;
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const ZONE_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];

export function ZoneEditor({ zone, circleId, isOpen, onClose, onUpdated }: ZoneEditorProps) {
  const [name, setName] = useState(zone?.name || '');
  const [description, setDescription] = useState(zone?.nameEn || '');
  const [color, setColor] = useState(zone?.colorHex || '#007AFF');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!zone || !name.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/zones/circles/${circleId}/${zone.zoneId}`, {
        name: name.trim(),
        nameEn: description.trim() || undefined,
        colorHex: color,
      });
      showToast('Zona actualizada', 'success');
      onUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!zone) return;
    setDeleting(true);
    try {
      await api.delete(`/zones/circles/${circleId}/${zone.zoneId}`);
      showToast('Zona eliminada', 'success');
      onUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!zone) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-50" />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[24px] shadow-2xl z-50 px-5 pb-8 pt-4 max-w-lg mx-auto"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-text-primary text-lg mb-4">Editar zona</h3>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la zona"
              className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary mb-3 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción"
              className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary mb-4 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />

            <div className="flex gap-2 mb-5">
              {ZONE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-accent' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <p className="text-xs text-text-secondary mb-4">Área: {Math.round(zone.areaSqm)} m²</p>

            <div className="flex gap-3">
              {!confirmDelete ? (
                <>
                  <button onClick={() => setConfirmDelete(true)} className="py-3 px-4 border border-error/30 text-error rounded-[12px] text-sm font-medium">
                    Eliminar
                  </button>
                  <button onClick={onClose} className="flex-1 py-3 border border-border rounded-[12px] text-sm text-text-secondary font-medium">
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving || !name.trim()} className="flex-1 py-3 bg-accent text-white rounded-[12px] text-sm font-medium disabled:opacity-50">
                    {saving ? '...' : 'Guardar'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 border border-border rounded-[12px] text-sm text-text-secondary font-medium">
                    No, cancelar
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-error text-white rounded-[12px] text-sm font-medium disabled:opacity-50">
                    {deleting ? '...' : 'Sí, eliminar zona'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
