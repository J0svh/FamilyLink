content = """import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarState } from './Avatar2D';

interface StatusOption {
  state: AvatarState;
  emoji: string;
  label: string;
  sublabel: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { state: 'idle', emoji: '\U0001f9cd', label: 'Disponible', sublabel: 'Sin actividad espec\u00edfica' },
  { state: 'walking', emoji: '\U0001f6b6', label: 'En movimiento', sublabel: 'Caminando o desplaz\u00e1ndome' },
  { state: 'sleeping', emoji: '\U0001f634', label: 'Descansando', sublabel: 'No molestar' },
  { state: 'working', emoji: '\U0001f4bc', label: 'Trabajando', sublabel: 'Ocupado en el trabajo' },
  { state: 'gym', emoji: '\U0001f3cb\ufe0f', label: 'En el gym', sublabel: 'Haciendo ejercicio' },
  { state: 'gaming', emoji: '\U0001f3ae', label: 'Jugando', sublabel: 'Tiempo libre' },
  { state: 'eating', emoji: '\U0001f37d\ufe0f', label: 'Comiendo', sublabel: 'Hora de comer' },
  { state: 'studying', emoji: '\U0001f4da', label: 'Estudiando', sublabel: 'Concentrado' },
];

interface StatusSelectorProps {
  currentState: AvatarState;
  onStateChange: (state: AvatarState, customLabel?: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function StatusSelector({ currentState, onStateChange, isOpen, onClose }: StatusSelectorProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto bg-surface rounded-[20px] shadow-2xl z-50 p-5"
          >
            <h3 className="font-semibold text-text-primary mb-4">Mi estado</h3>

            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.state}
                  onClick={() => { onStateChange(opt.state, opt.label); onClose(); }}
                  className={`flex items-center gap-2.5 p-3 rounded-[12px] border transition-all text-left ${
                    currentState === opt.state
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/30 bg-background'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{opt.label}</p>
                    <p className="text-[10px] text-text-secondary truncate">{opt.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
"""

with open('/home/jose/FamilyLink/frontend/src/components/StatusSelector.tsx', 'w') as f:
    f.write(content)

print('Done')
