import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { showToast } from './Toast';
import { haptics } from '../lib/haptics';
import { incrementChallenge } from '../lib/challenges';

interface ArrivedSafeProps {
  circleId: string;
}

export function ArrivedSafe({ circleId }: ArrivedSafeProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!navigator.geolocation) return;
    setSending(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Share location
          await api.post('/locations', {
            circleId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });

          // Send automatic message
          await api.post(`/chat/circles/${circleId}/messages`, {
            content: '📍 ¡Llegué bien! 👍',
            type: 'text',
          });

          haptics.success();
          showToast('¡Llegué bien! enviado al grupo', 'success');
          incrementChallenge('arrived');
          setSent(true);
          setTimeout(() => setSent(false), 5000);
        } catch {
          showToast('Error al enviar', 'error');
          haptics.strong();
        } finally {
          setSending(false);
        }
      },
      () => {
        setSending(false);
        showToast('No se pudo obtener la ubicación', 'error');
      },
      { enableHighAccuracy: true },
    );
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleSend}
      disabled={sending || sent}
      className={`px-4 py-2.5 rounded-[12px] font-medium text-sm shadow-md transition-all ${
        sent
          ? 'bg-success text-white'
          : 'bg-surface border border-border text-text-primary hover:border-accent/30'
      } disabled:opacity-60`}
    >
      {sent ? '✓ Enviado' : sending ? '...' : '🏠 Llegué bien'}
    </motion.button>
  );
}
