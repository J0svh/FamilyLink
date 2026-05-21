import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { showToast } from './Toast';
import { ZoneData } from './ZoneLayer';

interface ZoneManagerProps {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateZone: () => void;
  onZoneUpdated: () => void;
}

const ZONE_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];

export function ZoneManager({ circleId, isOpen, onClose, onCreateZone, onZoneUpdated }: ZoneManagerProps) {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<ZoneData | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('#007AFF');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && circleId) loadZones();
  }, [isOpen, circleId]);

  const loadZones = async () => {
    try {
      const { data } = await api.get(`/zones/circles/${circleId}`);
      setZones(data.zones || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const startEdit = (zone: ZoneData) => {
    setEditingZone(zone);
    setEditName(zone.name);
    setEditDesc(zone.nameEn || '');
    setEditColor(zone.colorHex);
  };

  const handleSave = async () => {
    if (!editingZone || !editName.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/zones/circles/${circleId}/${editingZone.zoneId}`, {
        name: editName.trim(),
        nameEn: editDesc.trim() || undefined,
        colorHex: editColor,
      });
      showToast('Zona actualizada', 'success');
      setEditingZone(null);
      loadZones();
      onZoneUpdated();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (zoneId: string) => {
    try {
      await api.delete(`/zones/circles/${circleId}/${zoneId}`);
      showToast('Zona eliminada', 'success');
      setZones(zones.filter(z => z.zoneId !== zoneId));
      onZoneUpdated();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-50" />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[24px] shadow-2xl z-50 px-5 pb-8 pt-4 max-w-lg mx-auto max-h-[70vh] flex flex-col"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary text-lg">Gestionar zonas</h3>
              <button
                onClick={() => { onCreateZone(); onClose(); }}
                className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-[8px]"
              >
                + Nueva zona
              </button>
            </div>

            {/* Zone list or edit form */}
            <div className="flex-1 overflow-y-auto">
              {editingZone ? (
                <div className="space-y-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Descripción"
                    className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                  <div className="flex gap-2">
                    {ZONE_COLORS.map(c => (
                      <button key={c} onClick={() => setEditColor(c)} className={`w-6 h-6 rounded-full ${editColor === c ? 'ring-2 ring-offset-1 ring-accent scale-110' : ''}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => setEditingZone(null)} className="flex-1 py-2.5 border border-border rounded-[10px] text-sm text-text-secondary">Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-accent text-white rounded-[10px] text-sm font-medium disabled:opacity-50">{saving ? '...' : 'Guardar'}</button>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : zones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary text-sm">No hay zonas creadas</p>
                  <p className="text-text-secondary/50 text-xs mt-1">Pulsa "+ Nueva zona" para crear una</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {zones.map(zone => (
                    <div key={zone.zoneId} className="flex items-center gap-3 p-3 bg-background rounded-[12px] border border-border">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: zone.colorHex }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{zone.name}</p>
                        {zone.nameEn && <p className="text-[10px] text-text-secondary truncate">{zone.nameEn}</p>}
                        <p className="text-[10px] text-text-secondary/50">{Math.round(zone.areaSqm)} m²</p>
                      </div>
                      <button onClick={() => startEdit(zone)} className="text-xs text-accent font-medium px-2">Editar</button>
                      <button onClick={() => handleDelete(zone.zoneId)} className="text-xs text-error font-medium px-2">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
