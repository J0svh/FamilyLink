import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyChallenges, claimChallenge, addMedal } from '../lib/challenges';
import { AchievementPopup } from './AchievementPopup';

// Re-export for backward compatibility
export { incrementChallenge } from '../lib/challenges';

interface DailyChallengesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyChallenges({ isOpen, onClose }: DailyChallengesProps) {
  const [data, setData] = useState(getDailyChallenges());
  const [claimingAchievement, setClaimingAchievement] = useState<any>(null);

  useEffect(() => {
    if (isOpen) setData(getDailyChallenges());
  }, [isOpen]);

  const handleClaim = (challenge: typeof data.challenges[0]) => {
    claimChallenge(challenge.id);
    addMedal(challenge.rewardEmoji);

    // Show achievement popup
    setClaimingAchievement({
      id: challenge.id,
      name: challenge.rewardName,
      description: challenge.description,
      emoji: challenge.rewardEmoji,
      category: 'exploration',
      rarity: 'common',
      condition: '',
    });

    setData(getDailyChallenges());
  };

  return (
    <>
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

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary text-lg">🎯 Retos del día</h3>
                  <p className="text-xs text-text-secondary">Completa retos para ganar medallas</p>
                </div>
                {data.streak > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-warning/10 rounded-full">
                    <span className="text-sm">🔥</span>
                    <span className="text-xs font-bold text-warning">{data.streak} días</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {data.challenges.map(c => (
                  <div key={c.id} className={`flex items-center gap-3 p-3.5 rounded-[14px] border transition-all ${c.claimed ? 'bg-success/5 border-success/20' : c.completed ? 'bg-warning/5 border-warning/30' : 'bg-background border-border'}`}>
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{c.title}</p>
                      <p className="text-[11px] text-text-secondary">{c.description}</p>
                      <div className="mt-1.5 h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((c.current / c.target) * 100, 100)}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${c.claimed ? 'bg-success' : c.completed ? 'bg-warning' : 'bg-accent'}`}
                        />
                      </div>
                    </div>

                    {/* Status / Claim button */}
                    {c.claimed ? (
                      <span className="text-success text-lg">✓</span>
                    ) : c.completed ? (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleClaim(c)}
                        className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-[8px] shadow-md animate-pulse"
                      >
                        🏆 Reclamar
                      </motion.button>
                    ) : (
                      <span className="text-sm font-medium text-text-secondary">{c.current}/{c.target}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Achievement popup when claiming */}
      <AchievementPopup
        achievement={claimingAchievement}
        isOpen={!!claimingAchievement}
        onClose={() => setClaimingAchievement(null)}
        onAddToProfile={() => setClaimingAchievement(null)}
      />
    </>
  );
}
