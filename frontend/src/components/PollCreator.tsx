import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { showToast } from './Toast';
import { incrementChallenge } from '../lib/challenges';

interface PollCreatorProps {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PollCreator({ circleId, isOpen, onClose }: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [sending, setSending] = useState(false);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const updateOption = (i: number, value: string) => {
    const updated = [...options];
    updated[i] = value;
    setOptions(updated);
  };

  const removeOption = (i: number) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) {
      showToast('Necesitas una pregunta y al menos 2 opciones', 'error');
      return;
    }

    setSending(true);
    try {
      const pollContent = `📊 ${question}\n${options.filter(o => o.trim()).map((o, i) => `${['🅰️','🅱️','🅲️','🅳️','🅴️','🅵️'][i]} ${o}`).join('\n')}`;
      await api.post(`/chat/circles/${circleId}/messages`, { content: pollContent, type: 'text' });
      showToast('Encuesta enviada', 'success');
      incrementChallenge('poll');
      onClose();
      setQuestion('');
      setOptions(['', '']);
    } catch {
      showToast('Error al enviar encuesta', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
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
            <h3 className="font-semibold text-text-primary text-lg mb-4">📊 Crear encuesta</h3>

            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="¿Cuál es tu pregunta?"
              className="w-full px-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary mb-3 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />

            <div className="space-y-2 mb-3">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-[10px] text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/20"
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="text-error text-sm px-2">✕</button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button onClick={addOption} className="text-accent text-xs font-medium mb-4">+ Añadir opción</button>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-[10px] text-sm text-text-secondary">Cancelar</button>
              <button onClick={handleSubmit} disabled={sending} className="flex-1 py-2.5 bg-accent text-white rounded-[10px] text-sm font-medium disabled:opacity-50">
                {sending ? '...' : 'Enviar'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
