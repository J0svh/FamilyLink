import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATARS, AvatarOption } from '../lib/avatars';
import { showToast } from './Toast';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarId: string;
  onAvatarChange: (avatarId: string) => void;
  mapStyle?: 'streets' | 'dark' | 'satellite' | 'toner';
}

export function AvatarSelector({ isOpen, onClose, currentAvatarId, onAvatarChange, mapStyle = 'streets' }: AvatarSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'male' | 'female'>('all');
  const [saving, setSaving] = useState(false);

  const filteredAvatars = filter === 'all' ? AVATARS : AVATARS.filter(a => a.gender === filter || a.gender === 'neutral');

  const isDark = mapStyle === 'dark' || mapStyle === 'satellite';

  const handleSelect = async (avatar: AvatarOption) => {
    if (avatar.id === currentAvatarId) return;
    setSaving(true);

    try {
      // Save locally (backend persistence in future version)
      onAvatarChange(avatar.id);
      showToast('Icono cambiado correctamente', 'success');
      if (navigator.vibrate) navigator.vibrate(50);
      onClose();
    } catch {
      showToast('Se ha producido un error, inténtalo luego', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className={`fixed bottom-20 left-4 right-4 max-w-sm mx-auto rounded-[20px] shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-surface border border-border'}`}
          >
            {/* Header */}
            <div className={`px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-border'}`}>
              <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-text-primary'}`}>Elige tu avatar</h3>
              {/* Filter tabs */}
              <div className="flex gap-2 mt-3">
                {(['all', 'male', 'female'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      filter === f
                        ? 'bg-accent text-white'
                        : isDark ? 'text-white/60 hover:text-white' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'male' ? '♂ Chico' : '♀ Chica'}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar grid */}
            <div className="grid grid-cols-5 gap-2 p-4 max-h-[280px] overflow-y-auto">
              {filteredAvatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelect(avatar)}
                  disabled={saving}
                  className={`relative aspect-square rounded-[14px] overflow-hidden transition-all hover:scale-105 active:scale-95 ${
                    currentAvatarId === avatar.id
                      ? 'ring-3 ring-accent ring-offset-2'
                      : isDark ? 'hover:ring-1 hover:ring-white/30' : 'hover:ring-1 hover:ring-border'
                  } ${isDark ? 'ring-offset-[#1C1C1E]' : 'ring-offset-surface'}`}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.id}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {currentAvatarId === avatar.id && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <span className="text-white text-lg font-bold drop-shadow">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
