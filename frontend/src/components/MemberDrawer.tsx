import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

interface Member {
  userId: string;
  username: string;
  role: string;
  isOnline: boolean;
}

interface MemberDrawerProps {
  circleId: string;
  circleName: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  CIRCLE_ADMIN: 'bg-amber-500/20 text-amber-400',
  CIRCLE_MEMBER: 'bg-white/10 text-white/60',
};

const AVATAR_COLORS = [
  'bg-blue-500/30',
  'bg-purple-500/30',
  'bg-pink-500/30',
  'bg-green-500/30',
  'bg-orange-500/30',
  'bg-cyan-500/30',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function MemberDrawer({ circleId, circleName, isOpen, onClose, onOpenChat }: MemberDrawerProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !circleId) return;
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/circles/${circleId}/members`);
        if (Array.isArray(data)) {
          setMembers(data);
        }
      } catch (err) {
        console.error('Failed to fetch members', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [isOpen, circleId]);

  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'CIRCLE_ADMIN' && b.role !== 'CIRCLE_ADMIN') return -1;
    if (a.role !== 'CIRCLE_ADMIN' && b.role === 'CIRCLE_ADMIN') return 1;
    return a.username.localeCompare(b.username);
  });

  const onlineCount = members.filter((m) => m.isOnline).length;

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

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#1c1c1e]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{circleName}</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  {members.length} miembros · {onlineCount} en línea
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Member list */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-white/5 transition-colors"
                    >
                      {/* Avatar with online dot */}
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${getAvatarColor(member.username)}`}>
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        {member.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c1e]" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{member.username}</p>
                      </div>

                      {/* Role badge */}
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${ROLE_COLORS[member.role] || ROLE_COLORS.CIRCLE_MEMBER}`}>
                        {member.role === 'CIRCLE_ADMIN' ? 'Admin' : 'Miembro'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat button */}
            <div className="px-5 py-4 border-t border-white/10">
              <button
                onClick={onOpenChat}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-[12px] transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Abrir chat
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
