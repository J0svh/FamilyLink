import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../lib/haptics';

interface GhostModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export function GhostMode({ isActive, onToggle }: GhostModeProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    if (isActive) {
      onToggle(false);
      haptics.light();
    } else {
      setShowConfirm(true);
    }
  };

  const confirmActivate = () => {
    onToggle(true);
    setShowConfirm(false);
    haptics.medium();
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] flex items-center justify-center transition-all shadow-md border ${
          isActive
            ? 'bg-purple-500/90 border-purple-400/50 text-white'
            : 'bg-surface/90 backdrop-blur-md border-border/50 text-text-secondary'
        }`}
        title={isActive ? 'Modo fantasma activo' : 'Activar modo fantasma'}
      >
        👻
      </button>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="fixed inset-0 bg-black/40 z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-[20px] shadow-2xl p-6 w-[300px] z-50"
            >
              <p className="text-3xl text-center mb-3">👻</p>
              <h3 className="font-semibold text-text-primary text-center">Modo Fantasma</h3>
              <p className="text-xs text-text-secondary text-center mt-2">
                Serás invisible en el mapa sin que nadie reciba notificación. Nadie sabrá que lo activaste.
              </p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-border rounded-[10px] text-sm text-text-secondary">Cancelar</button>
                <button onClick={confirmActivate} className="flex-1 py-2.5 bg-purple-500 text-white rounded-[10px] text-sm font-medium">Activar</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
