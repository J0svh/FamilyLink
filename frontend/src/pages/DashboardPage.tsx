import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useCircleStore } from '../stores/circleStore';

interface CircleData {
  circleId: string;
  name: string;
  role: string;
  memberCount?: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { username, logout } = useAuthStore();
  const { circles, setCircles } = useCircleStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const { data } = await api.get('/circles');
      setCircles(data);
    } catch (err) {
      console.error('Failed to load circles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;

    try {
      const { data } = await api.post('/circles', { name: newCircleName });
      useCircleStore.getState().addCircle(data);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">FamilyLink</h1>
            <p className="text-sm text-text-secondary">Hola, {username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-text-secondary hover:text-error transition-colors"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">{t('dashboard.title')}</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[10px] transition-colors"
          >
            + {t('dashboard.createCircle')}
          </button>
        </div>

        {/* Circle list */}
        {loading ? (
          <p className="text-text-secondary text-center py-12">{t('app.loading')}</p>
        ) : circles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-text-secondary text-lg">{t('dashboard.noCircles')}</p>
            <p className="text-text-secondary/60 text-sm mt-2">
              Crea un círculo para empezar a compartir ubicación con tu familia.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {circles.map((circle, index) => (
              <motion.div
                key={circle.circleId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/map/${circle.circleId}`)}
                className="bg-surface rounded-[14px] shadow-[0_1px_10px_rgba(0,0,0,0.04)] p-5 cursor-pointer hover:shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">{circle.name}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {circle.role === 'CIRCLE_ADMIN' ? t('dashboard.admin') : t('dashboard.member')}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-accent text-lg">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-[16px] shadow-xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('dashboard.createCircle')}
            </h3>
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
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-border rounded-[10px] text-text-secondary font-medium hover:bg-background transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[10px] font-medium transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
