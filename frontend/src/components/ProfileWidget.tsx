import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAvatarSrc } from '../lib/avatars';
import { ACHIEVEMENTS, RARITY_COLORS } from '../lib/achievements';

interface ProfileWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  avatarId: string | null;
  isCurrentUser: boolean;
  status?: string;
}

export function ProfileWidget({ isOpen, onClose, username, avatarId, isCurrentUser, status }: ProfileWidgetProps) {
  const navigate = useNavigate();

  // Mock unlocked (empty by default)
  const unlockedAchievements: typeof ACHIEVEMENTS = [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-surface rounded-[20px] shadow-2xl border border-border z-50 overflow-hidden"
          >
            {/* Mini banner */}
            <div className="h-12 bg-gradient-to-r from-accent/20 to-purple-500/20" />

            <div className="px-5 pb-5 -mt-6">
              {/* Avatar */}
              <img src={getAvatarSrc(avatarId)} alt={username} className="w-14 h-14 rounded-full ring-3 ring-surface shadow-md" />

              {/* Info */}
              <h3 className="font-bold text-text-primary mt-2">{username}</h3>
              {status && <p className="text-xs text-text-secondary">{status}</p>}

              {/* Achievements */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider">Medallas</p>
                  <button
                    onClick={() => { navigate('/profile'); onClose(); }}
                    className="text-[10px] text-accent font-medium"
                  >
                    Ver todas →
                  </button>
                </div>
                {unlockedAchievements.length > 0 ? (
                  <div className="flex gap-1.5">
                    {unlockedAchievements.slice(0, 5).map(a => (
                      <div key={a.id} className={`w-7 h-7 rounded-[6px] bg-gradient-to-br ${RARITY_COLORS[a.rarity]} flex items-center justify-center text-sm`}>
                        {a.emoji}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-text-secondary/50 italic">Sin medallas aún</p>
                )}
              </div>

              {/* Action */}
              {isCurrentUser && (
                <button
                  onClick={() => { navigate('/profile'); onClose(); }}
                  className="w-full mt-4 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent font-medium text-xs rounded-[10px] transition-colors"
                >
                  Ver perfil completo
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
