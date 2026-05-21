import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  { id: 'blue', name: 'Azul', from: '#007AFF', to: '#0056CC' },
  { id: 'purple', name: 'Morado', from: '#AF52DE', to: '#7B2CBF' },
  { id: 'green', name: 'Verde', from: '#34C759', to: '#248A3D' },
  { id: 'orange', name: 'Naranja', from: '#FF9500', to: '#CC7700' },
  { id: 'pink', name: 'Rosa', from: '#FF2D55', to: '#CC2244' },
  { id: 'teal', name: 'Turquesa', from: '#5AC8FA', to: '#32ADE6' },
  { id: 'red', name: 'Rojo', from: '#FF3B30', to: '#CC2F26' },
  { id: 'dark', name: 'Oscuro', from: '#1C1C1E', to: '#3A3A3C' },
];

interface ChatThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ChatThemePicker({ isOpen, onClose, currentTheme, onThemeChange }: ChatThemePickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-50" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-[20px] shadow-2xl p-5 w-[320px] z-50"
          >
            <h3 className="font-semibold text-text-primary mb-4">🎨 Tema del chat</h3>
            <div className="grid grid-cols-4 gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => { onThemeChange(theme.id); onClose(); }}
                  className={`aspect-square rounded-[12px] transition-all hover:scale-110 active:scale-95 ${currentTheme === theme.id ? 'ring-2 ring-offset-2 ring-accent' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                  title={theme.name}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
