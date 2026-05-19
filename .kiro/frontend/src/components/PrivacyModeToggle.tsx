import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

interface PrivacyModeToggleProps {
  circleId: string;
  isActive: boolean;
  activationsRemaining: number;
  onToggle: () => void;
}

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '4h', value: 240 },
  { label: '8h', value: 480 },
];

export function PrivacyModeToggle({ circleId, isActive, activationsRemaining, onToggle }: PrivacyModeToggleProps) {
  const { t } = useTranslation();
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = async (durationMinutes: number) => {
    setLoading(true);
    try {
      await api.post('/privacy/activate', { circleId, durationMinutes });
      onToggle();
      setShowDurationPicker(false);
    } catch (err) {
      console.error('Failed to activate privacy mode', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await api.post('/privacy/deactivate', { circleId });
      onToggle();
    } catch (err) {
      console.error('Failed to deactivate privacy mode', err);
    } finally {
      setLoading(false);
    }
  };

  if (isActive) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleDeactivate}
        disabled={loading}
        className="px-5 py-3 bg-warning/90 text-white font-medium rounded-full shadow-lg backdrop-blur-sm"
      >
        🔒 {t('privacy.deactivate')}
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDurationPicker(!showDurationPicker)}
        className="px-5 py-3 bg-surface/90 backdrop-blur-sm text-text-primary font-medium rounded-full shadow-lg border border-border"
      >
        🔓 {t('privacy.activate')}
      </motion.button>

      {/* Remaining counter */}
      <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
        {activationsRemaining}
      </span>

      {/* Duration picker */}
      <AnimatePresence>
        {showDurationPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-surface rounded-[16px] shadow-xl border border-border p-4 w-56"
          >
            <p className="text-xs text-text-secondary mb-3 text-center">{t('privacy.duration')}</p>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleActivate(opt.value)}
                  disabled={loading || activationsRemaining <= 0}
                  className="py-2 px-2 bg-background rounded-[8px] text-sm font-medium text-text-primary hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-3 text-center">
              {activationsRemaining} {t('privacy.remaining')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
