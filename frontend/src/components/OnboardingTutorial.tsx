import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  title: string;
  description: string;
  emoji: string;
}

interface OnboardingTutorialProps {
  steps: OnboardingStep[];
  storageKey: string;
}

const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

export function OnboardingTutorial({ steps, storageKey }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem(storageKey);
    if (!lastShown) {
      setVisible(true);
    } else {
      const timestamp = parseInt(lastShown, 10);
      if (!isNaN(timestamp) && Date.now() - timestamp > THREE_WEEKS_MS) {
        setVisible(true);
      }
    }
  }, [storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem(storageKey, Date.now().toString());
      setVisible(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center px-4"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-surface rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Emoji header */}
          <div className="bg-gradient-to-br from-accent to-blue-600 px-6 py-8 text-center">
            <motion.span
              key={step.emoji}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="text-5xl block"
            >
              {step.emoji}
            </motion.span>
          </div>

          {/* Content */}
          <div className="px-6 py-5 text-center">
            <h3 className="text-lg font-bold text-text-primary">{step.title}</h3>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{step.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-accent w-5' : 'bg-border'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 text-text-secondary text-sm font-medium hover:text-text-primary transition-colors"
            >
              Saltar
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[12px] transition-colors"
            >
              {isLast ? 'Entendido' : 'Siguiente'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Predefined step sets
export const MAP_ONBOARDING_STEPS: OnboardingStep[] = [
  { emoji: '👋', title: 'Bienvenido a FamilyLink', description: 'Este es tu mapa. Aquí verás la ubicación de tu familia y amigos cuando la compartan contigo.' },
  { emoji: '📍', title: 'Compartir ubicación', description: 'Pulsa "Compartir" para que tu familia/amigos vean dónde estás. Solo se comparte cuando TÚ decides.' },
  { emoji: '🗺️', title: 'Zonas', description: 'Crea zonas como "Casa" o "Trabajo". Pulsa "Zonas", luego toca un punto en el mapa para colocarla.' },
  { emoji: '💬', title: 'Chat del grupo', description: 'Habla con tu grupo pulsando el icono de chat. Puedes enviar emojis, GIFs, fotos y notas de voz.' },
  { emoji: '🎨', title: 'Estilos de mapa', description: 'Desliza la barra superior para cambiar el estilo: callejero, nocturno, satélite o toner.' },
  { emoji: '🎯', title: 'Retos diarios', description: 'Completa retos para ganar medallas. Pulsa el icono de diana para ver los retos de hoy.' },
  { emoji: '🚀', title: 'Listo para empezar', description: 'Ya conoces lo básico. Explora, comparte y diviértete con tu familia y amigos.' },
];

export const DASHBOARD_ONBOARDING_STEPS: OnboardingStep[] = [
  { emoji: '🏠', title: 'Tu espacio', description: 'Este es tu Dashboard. Aquí ves todos tus círculos de familia y amigos.' },
  { emoji: '➕', title: 'Crear un círculo', description: 'Pulsa "+ Crear círculo" para crear un grupo nuevo. Ponle un nombre y listo.' },
  { emoji: '👥', title: 'Invitar personas', description: 'Pasa el ratón sobre un círculo y pulsa el icono de persona+ para invitar a alguien por email o nombre.' },
  { emoji: '🗺️', title: 'Entrar al mapa', description: 'Pulsa en un círculo para abrir el mapa y ver las ubicaciones de tu grupo.' },
];

export const PROFILE_ONBOARDING_STEPS: OnboardingStep[] = [
  { emoji: '👤', title: 'Tu perfil', description: 'Aquí puedes ver y editar tu información personal, avatar y apodo.' },
  { emoji: '🎨', title: 'Cambiar avatar', description: 'Pulsa sobre tu foto de perfil o "Editar perfil" para elegir un nuevo avatar.' },
  { emoji: '🏆', title: 'Medallas', description: 'Completa retos diarios para desbloquear medallas que aparecerán aquí.' },
];

export const CIRCLE_MANAGEMENT_ONBOARDING_STEPS: OnboardingStep[] = [
  { emoji: '⚙️', title: 'Gestión del círculo', description: 'Aquí puedes administrar los miembros de tu círculo de familia/amigos.' },
  { emoji: '✉️', title: 'Invitar', description: 'Escribe el email de la persona que quieres invitar y pulsa "Invitar".' },
  { emoji: '👑', title: 'Roles', description: 'Puedes hacer admin a otros miembros o eliminarlos del grupo.' },
];
