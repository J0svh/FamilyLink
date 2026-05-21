import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, RARITY_COLORS, RARITY_LABELS } from '../lib/achievements';
import { haptics } from '../lib/haptics';
import { playNotificationSound } from '../lib/sounds';

interface AchievementPopupProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToProfile: () => void;
}

export function AchievementPopup({ achievement, isOpen, onClose, onAddToProfile }: AchievementPopupProps) {
  useEffect(() => {
    if (isOpen && achievement) {
      haptics.success();
      playNotificationSound();
      // Trigger confetti
      launchConfetti();
    }
  }, [isOpen, achievement]);

  const launchConfetti = () => {
    // Simple CSS confetti effect
    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none z-[200]';
    container.innerHTML = Array.from({ length: 50 }, () => {
      const x = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const color = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE'][Math.floor(Math.random() * 6)];
      return `<div style="position:absolute;left:${x}%;top:-10px;width:8px;height:8px;background:${color};border-radius:2px;animation:confetti-fall 2s ${delay}s ease-in forwards;"></div>`;
    }).join('');
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3000);
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] max-w-[90vw] z-[101]"
          >
            <div className="bg-surface rounded-[24px] shadow-2xl overflow-hidden">
              {/* Header gradient */}
              <div className={`bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} px-6 py-8 text-center`}>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-6xl block mb-3"
                >
                  {achievement.emoji}
                </motion.span>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                  ¡Logro desbloqueado!
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-5 text-center">
                <h3 className="text-lg font-bold text-text-primary">{achievement.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{achievement.description}</p>
                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white`}>
                  {RARITY_LABELS[achievement.rarity]}
                </span>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 border border-border rounded-[12px] text-sm text-text-secondary font-medium">
                  Cerrar
                </button>
                <button onClick={() => { onAddToProfile(); onClose(); }} className="flex-1 py-3 bg-accent text-white rounded-[12px] text-sm font-medium">
                  Añadir al perfil
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
