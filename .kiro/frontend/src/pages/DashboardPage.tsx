import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useCircleStore } from '../stores/circleStore';
import { InviteModal } from '../components/InviteModal';
import { ToastContainer } from '../components/Toast';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { username, logout } = useAuthStore();
  const { circles, setCircles, addCircle } = useCircleStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCircleId, setInviteCircleId] = useState('');
  const [newCircleName, setNewCircleName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;

    try {
      const { data } = await api.post('/circles', { name: newCircleName });
      addCircle(data);
      setNewCircleName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create circle', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openInvite = (circleId: string) => {
    setInviteCircleId(circleId);
    setShowInviteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <ToastContainer />

      {/* Header */}
      <header className="px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">FamilyLink</h1>
            <p className="text-sm text-white/60">Hola, {username} 👋</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-[10px] border border-white/10 hover:border-white/20"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{t('dashboard.title')}</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-[12px] transition-colors border border-white/10"
          >
            + {t('dashboard.createCircle')}
          </button>
        </div>

        {/* Circle list */}
        {circles.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <p className="text-white/70 text-base">{t('dashboard.noCircles')}</p>
            <p className="text-white/40 text-sm mt-2">Crea un círculo para empezar</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {circles.map((circle, index) => (
              <motion.div
                key={circle.circleId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-[16px] border border-white/10 p-5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <button onClick={() => navigate(`/map/${circle.circleId}`)} className="flex-1 text-left">
                    <h3 className="font-medium text-white">{circle.name}</h3>
                    <p className="text-sm text-white/50 mt-0.5">
                      {circle.role === 'CIRCLE_ADMIN' ? '👑 Admin' : 'Miembro'}
                    </p>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Invite button */}
                    {circle.role === 'CIRCLE_ADMIN' && (
                      <button
                        onClick={() => openInvite(circle.circleId)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-accent/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Invitar miembro"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                      </button>
                    )}

                    {/* Go to map */}
                    <button
                      onClick={() => navigate(`/map/${circle.circleId}`)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-accent/20 hover:bg-accent/30 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-[20px] shadow-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">{t('dashboard.createCircle')}</h3>
            <form onSubmit={handleCreateCircle}>
              <input
                type="text"
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                placeholder="Nombre del círculo"
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                autoFocus
              />
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-border rounded-[10px] text-text-secondary font-medium">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[10px] font-medium">Crear</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        circleId={inviteCircleId}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
