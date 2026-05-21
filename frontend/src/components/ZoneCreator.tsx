import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { showToast } from './Toast';
import { haptics } from '../lib/haptics';

interface ZoneCreatorProps {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
  selectedPoint: { lat: number; lng: number } | null;
  onZoneCreated: () => void;
}

const ZONE_TYPES = [
  { id: 'home', emoji: '🏠', label: 'Casa' },
  { id: 'work', emoji: '💼', label: 'Trabajo' },
  { id: 'school', emoji: '📚', label: 'Estudio' },
  { id: 'gym', emoji: '🏋️', label: 'Gym' },
  { id: 'other', emoji: '📍', label: 'Otro' },
];

const ZONE_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];

function generateCircleVertices(center: { lat: number; lng: number }, radiusMeters: number, numPoints = 32): { lat: number; lng: number }[] {
  const vertices: { lat: number; lng: number }[] = [];
  const earthRadius = 6371000;
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const dLat = (radiusMeters / earthRadius) * Math.cos(angle);
    const dLng = (radiusMeters / (earthRadius * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle);
    vertices.push({
      lat: center.lat + (dLat * 180) / Math.PI,
      lng: center.lng + (dLng * 180) / Math.PI,
    });
  }
  return vertices;
}

export function ZoneCreator({ circleId, isOpen, onClose, selectedPoint, onZoneCreated }: ZoneCreatorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('home');
  const [color, setColor] = useState('#007AFF');
  const [radius, setRadius] = useState(150);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !selectedPoint) {
      showToast('Pon un nombre y selecciona un punto en el mapa', 'error');
      return;
    }

    setSaving(true);
    try {
      const vertices = generateCircleVertices(selectedPoint, radius);
      const selectedType = ZONE_TYPES.find(t => t.id === type);
      const fullName = `${selectedType?.emoji || '📍'} ${name.trim()}`;

      await api.post(`/zones/circles/${circleId}`, {
        name: fullName,
        nameEn: description.trim() || undefined,
        colorHex: color,
        vertices,
      });

      haptics.success();
      showToast('Zona creada correctamente', 'success');
      onZoneCreated();
      onClose();
      setName('');
      setDescription('');
      setRadius(150);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al crear zona', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[24px] shadow-2xl z-40 px-5 pb-8 pt-4 max-w-lg mx-auto"
        >
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

          <h3 className="font-semibold text-text-primary text-lg mb-1">Crear zona</h3>
          <p className="text-xs text-text-secondary mb-4">
            {selectedPoint ? `📍 ${selectedPoint.lat.toFixed(4)}, ${selectedPoint.lng.toFixed(4)}` : 'Toca un punto en el mapa para colocar la zona'}
          </p>

          {/* Name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej: Casa de Jose)"
            className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary mb-3 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />

          {/* Description */}
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (ej: Aquí vive Jose)"
            className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary mb-4 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />

          {/* Type selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {ZONE_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium whitespace-nowrap transition-all ${
                  type === t.id ? 'bg-accent text-white' : 'bg-background border border-border text-text-secondary'
                }`}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Color selector */}
          <div className="flex gap-2 mb-4">
            {ZONE_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-accent' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Radius slider */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>Radio</span>
              <span className="font-medium text-text-primary">{radius}m</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[10px] text-text-secondary/50 mt-0.5">
              <span>50m</span><span>500m</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-border rounded-[12px] text-sm text-text-secondary font-medium">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !selectedPoint || !name.trim()}
              className="flex-1 py-3 bg-accent text-white rounded-[12px] text-sm font-medium disabled:opacity-50"
            >
              {saving ? '...' : 'Crear zona'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
