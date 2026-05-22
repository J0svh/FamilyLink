import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { getAvatarSrc } from '../lib/avatars';
import { ACHIEVEMENTS, RARITY_COLORS } from '../lib/achievements';
import { AvatarSelector } from '../components/AvatarSelector';
import { ToastContainer, showToast } from '../components/Toast';
import { OnboardingTutorial, PROFILE_ONBOARDING_STEPS } from '../components/OnboardingTutorial';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const { userId, username, email, avatarId, setAvatarId } = useAuthStore();
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);

  const isOwnProfile = !profileUserId || profileUserId === userId;

  // Mock unlocked achievements (in production, fetch from backend)
  const unlockedAchievements = ACHIEVEMENTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <ToastContainer />
      <OnboardingTutorial
        steps={PROFILE_ONBOARDING_STEPS}
        storageKey="familylink-onboarding-profile-done"
      />

      {/* Header */}
      <div className="px-6 py-4">
        <button onClick={() => navigate(-1)} className="text-white/70 text-sm hover:text-white">
          ← Volver
        </button>
      </div>

      {/* Profile card */}
      <div className="max-w-sm mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-[24px] border border-white/10 overflow-hidden"
        >
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-accent/30 to-purple-500/30" />

          {/* Avatar */}
          <div className="px-6 -mt-10">
            <div className="relative inline-block">
              <img
                src={getAvatarSrc(avatarId)}
                alt={username || ''}
                className="w-20 h-20 rounded-full ring-4 ring-[#1a1a2e] object-cover"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-accent rounded-full flex items-center justify-center ring-2 ring-[#1a1a2e]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="px-6 pt-3 pb-6">
            <h2 className="text-xl font-bold text-white">{username}</h2>

            {/* Nickname */}
            {editingNickname ? (
              <div className="flex gap-2 mt-1">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Tu apodo..."
                  className="flex-1 px-3 py-1 bg-white/10 border border-white/20 rounded-[8px] text-sm text-white placeholder-white/30 focus:outline-none"
                  autoFocus
                  maxLength={30}
                />
                <button onClick={() => { setEditingNickname(false); showToast('Apodo guardado', 'success'); }} className="text-accent text-xs font-medium">✓</button>
              </div>
            ) : (
              <button onClick={() => isOwnProfile && setEditingNickname(true)} className="text-white/50 text-sm mt-0.5 hover:text-white/70">
                {nickname || (isOwnProfile ? '+ Añadir apodo' : '')}
              </button>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-white/40">{email}</span>
              <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-full">👑 Admin</span>
            </div>

            {/* Achievements */}
            <div className="mt-5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Medallas</p>
              {unlockedAchievements.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {unlockedAchievements.map(a => (
                    <div
                      key={a.id}
                      className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${RARITY_COLORS[a.rarity]} flex items-center justify-center text-lg shadow-md`}
                      title={`${a.name}: ${a.description}`}
                    >
                      {a.emoji}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-xs">Aún no hay medallas</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/5 rounded-[12px] p-3 text-center">
                <p className="text-lg font-bold text-white">12</p>
                <p className="text-[10px] text-white/40">Ubicaciones</p>
              </div>
              <div className="bg-white/5 rounded-[12px] p-3 text-center">
                <p className="text-lg font-bold text-white">3</p>
                <p className="text-[10px] text-white/40">Círculos</p>
              </div>
              <div className="bg-white/5 rounded-[12px] p-3 text-center">
                <p className="text-lg font-bold text-white">7</p>
                <p className="text-[10px] text-white/40">Días activo</p>
              </div>
            </div>

            {/* Edit profile button */}
            {isOwnProfile && (
              <button
                onClick={() => setShowAvatarSelector(true)}
                className="w-full mt-5 py-3 bg-accent/20 hover:bg-accent/30 text-accent font-medium text-sm rounded-[12px] transition-colors"
              >
                ✏️ Editar perfil
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Avatar Selector */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatarId={avatarId || 'avatar-17'}
        onAvatarChange={(id) => setAvatarId(id)}
        mapStyle="dark"
      />
    </div>
  );
}
