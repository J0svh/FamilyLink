import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const INVITATION_POLL_MS = 2000; // Reducido a 2 segundos para respuesta más rápida

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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.userId);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastInvitationIds = useRef<Set<string>>(new Set());
  const socketRef = useRef<any>(null);

  const fetchInvitations = useCallback(async (openOnNewInvitation = false) => {
    try {
      const { data } = await api.get('/circles/invitations/pending');
      if (!Array.isArray(data)) return;

      setInvitations(data);

      if (openOnNewInvitation && data.length > 0) {
        const previousIds = lastInvitationIds.current;
        const hasNewInvitation = data.some((inv: Invitation) => !previousIds.has(inv.invitationId));
        if (hasNewInvitation) {
          setIsOpen(true);
        }
      }

      lastInvitationIds.current = new Set(data.map((inv: Invitation) => inv.invitationId));
    } catch (err) {
      console.error('Failed to fetch invitations', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setInvitations([]);
      lastInvitationIds.current = new Set();
      return;
    }

    fetchInvitations();

    // WebSocket listener for real-time invitation updates
    try {
      const io = (window as any).io;
      if (io && !socketRef.current) {
        socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
          auth: { userId },
          path: '/ws',
        });

        socketRef.current.on('invitation:new', () => {
          console.debug('New invitation received via WebSocket');
          fetchInvitations(true);
        });

        socketRef.current.on('connect', () => {
          console.debug('WebSocket connected for invitations');
        });
      }
    } catch (err) {
      console.debug('WebSocket not available, using polling only', err);
    }

    // Polling as fallback (every 2 seconds when visible)
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchInvitations(true);
      }
    }, INVITATION_POLL_MS);

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchInvitations(true);
      }
    };

    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [fetchInvitations, isAuthenticated, userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleInbox = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      fetchInvitations();
    }
  };

  const handleAccept = async (inv: Invitation) => {
    setLoadingId(inv.invitationId);
    try {
      const { data } = await api.post(`/circles/invitations/${inv.invitationId}/accept`);
      setInvitations((prev) => prev.filter((i) => i.invitationId !== inv.invitationId));
      lastInvitationIds.current.delete(inv.invitationId);
      onCircleAdded({ circleId: data.circleId, name: data.circleName, role: data.role });
      setIsOpen(false);
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
      lastInvitationIds.current.delete(inv.invitationId);
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
        onClick={toggleInbox}
        className="relative w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label={`Invitaciones pendientes: ${invitations.length}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {invitations.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
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
            className="absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] bg-[#1c1c1e]/95 backdrop-blur-xl rounded-[16px] border border-white/10 shadow-2xl z-50 overflow-hidden"
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
                  <div
                    key={inv.invitationId}
                    className="px-4 py-3 border-b border-white/5 last:border-0"
                  >
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
                        className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-[8px] hover:bg-green-500/30 transition-colors disabled:opacity-50"
                      >
                        {loadingId === inv.invitationId ? '...' : 'Aceptar'}
                      </button>
                      <button
                        onClick={() => handleReject(inv)}
                        disabled={loadingId === inv.invitationId}
                        className="px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-[8px] hover:bg-red-500/30 transition-colors disabled:opacity-50"
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
