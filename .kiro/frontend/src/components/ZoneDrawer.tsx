import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

interface Vertex {
  lat: number;
  lng: number;
}

interface ZoneDrawerProps {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
  onZoneCreated: () => void;
  vertices: Vertex[];
}

const PRESET_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
];

export function ZoneDrawer({ circleId, isOpen, onClose, onZoneCreated, vertices }: ZoneDrawerProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [colorHex, setColorHex] = useState('#007AFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vertices.length < 3) {
      setError(t('zones.draw'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/zones/circles/${circleId}`, {
        name,
        nameEn: nameEn || undefined,
        colorHex,
        vertices,
      });
      onZoneCreated();
      onClose();
      setName('');
      setNameEn('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 bottom-0 w-80 bg-surface shadow-2xl z-40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">{t('zones.create')}</h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-xl">
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Zone name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('zones.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="Ej: Casa, Colegio..."
              />
            </div>

            {/* Zone name EN (optional) */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Name (English, optional)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="e.g. Home, School..."
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('zones.color')}
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColorHex(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      colorHex === color ? 'scale-125 ring-2 ring-offset-2 ring-accent' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Vertices info */}
            <div className="bg-background rounded-[12px] p-4">
              <p className="text-sm text-text-secondary">
                {vertices.length === 0
                  ? t('zones.draw')
                  : `${vertices.length} vértices seleccionados`}
              </p>
              {vertices.length >= 3 && (
                <p className="text-xs text-success mt-1">✓ Polígono válido</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || vertices.length < 3}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-[12px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : t('zones.save')}
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
