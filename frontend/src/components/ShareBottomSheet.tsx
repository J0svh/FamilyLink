import { motion, AnimatePresence } from 'framer-motion';

interface ShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShareWithGroup: () => void;
  onShareWithMember?: (memberId: string) => void;
  members?: { userId: string; username: string }[];
  loading?: boolean;
}

export function ShareBottomSheet({
  isOpen,
  onClose,
  onShareWithGroup,
  members = [],
  loading = false,
}: ShareBottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[24px] shadow-2xl z-50 px-6 pb-8 pt-4 max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />

            <h3 className="text-lg font-semibold text-text-primary mb-1">
              📍 Compartir mi ubicación
            </h3>
            <p className="text-sm text-text-secondary mb-5">
              Elige quién podrá ver dónde estás
            </p>

            {/* Share with group */}
            <button
              onClick={onShareWithGroup}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 bg-background rounded-[14px] border border-border hover:border-accent/30 transition-colors mb-3 disabled:opacity-50"
            >
              <div className="w-11 h-11 bg-accent/10 rounded-full flex items-center justify-center text-xl">
                👥
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary text-sm">Con todo el grupo</p>
                <p className="text-xs text-text-secondary">Todos los miembros verán tu posición</p>
              </div>
            </button>

            {/* Share with individual members */}
            {members.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {members.map((member) => (
                  <button
                    key={member.userId}
                    onClick={() => onShareWithGroup()} // TODO: Phase 2 - share with individual
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 bg-background rounded-[14px] border border-border hover:border-accent/30 transition-colors disabled:opacity-50"
                  >
                    <div className="w-11 h-11 bg-success/10 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-primary text-sm">Solo con {member.username}</p>
                      <p className="text-xs text-text-secondary">Solo esa persona verá tu ubicación</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full mt-4 py-3 text-text-secondary font-medium text-sm hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
