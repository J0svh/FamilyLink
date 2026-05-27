import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

interface Invitation {
  invitationId: string;
  circleId: string;
  circleName: string;
  invitedByUsername: string;
  createdAt: string;
}

interface InvitationInboxProps {
  onCircleAdded: (circle: { circleId: string; name: string; role: string }) => void;
}

export function InvitationInbox({ onCircleAdded }: InvitationInboxProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const { data } = await api.get('/circles/invitations/pending');
        if (Array.isArray(data)) {
          setInvitations(data);
        }
      } catch (err) {
        console.error('Failed to fetch invitations', err);
      }
    };
    fetchInvitations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = async (inv: Invitation) => {
    setLoadingId(inv.invitationId);
    try {
      const { data } = await api.post(`/circles/invitations/${inv.invitationId}/accept`);
      setInvitations((prev) => prev.filter((i) => i.invitationId !== inv.invitationId));
      onCircleAdded({ circleId: data.circleId, name: data.circleName, role: data.role });
    } catch (err) {
      console.error('Failed to accept invitation', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (inv: Invitation) => {
    setLoadingId(inv.invitationId);
    try {
      await api.post(`/circles/invitations/${inv.invitationId}/reject`);
      setInvitations((prev) => prev.filter((i) => i.invitationId !== inv.invitationId));
    } catch (err) {
      console.error('Failed to reject invitation', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {invitations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            {invitations.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 bg-[#1c1c1e]/95 backdrop-blur-xl rounded-[16px] border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Invitaciones pendientes</h3>
            </div>

            {invitations.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-white/50">No tienes invitaciones</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {invitations.map((inv) => (
                  <div key={inv.invitationId} className="px-4 py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {inv.invitedByUsername.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          <span className="font-medium">{inv.invitedByUsername}</span>
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          te invitó a <span className="text-white/70">{inv.circleName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 ml-11">
                      <button
                        onClick={() => handleAccept(inv)}
                        disabled={loadingId === inv.invitationId}
                        className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-[8px] hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleReject(inv)}
                        disabled={loadingId === inv.invitationId}
                        className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-[8px] hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
