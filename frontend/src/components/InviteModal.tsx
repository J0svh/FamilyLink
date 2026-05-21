import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { showToast } from './Toast';
import { getAvatarSrc } from '../lib/avatars';

interface SearchResult {
  userId: string;
  username: string;
  email: string;
  avatarId: string | null;
}

interface InviteModalProps {
  circleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ circleId, isOpen, onClose }: InviteModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchUsers(query.trim()), 300);
  }, [query]);

  const searchUsers = async (q: string) => {
    setSearching(true);
    try {
      const { data } = await api.get(`/auth/search?q=${encodeURIComponent(q)}`);
      setResults(data.users || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (user: SearchResult) => {
    setSending(user.userId);
    try {
      await api.post(`/circles/${circleId}/invitations`, { email: user.email });
      showToast(`Invitación enviada a ${user.username}`, 'success');
      setResults(results.filter(r => r.userId !== user.userId));
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('pending')) showToast('Ya tiene invitación pendiente', 'info');
      else if (msg.includes('already')) showToast('Ya es miembro del círculo', 'info');
      else showToast('Error al invitar', 'error');
    } finally {
      setSending(null);
    }
  };

  const handleEmailInvite = async () => {
    if (!query.includes('@')) return;
    setSending('email');
    try {
      await api.post(`/circles/${circleId}/invitations`, { email: query.trim() });
      showToast(`Invitación enviada a ${query}`, 'success');
      setQuery('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSending(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-[20px] shadow-2xl w-[380px] max-w-[90vw] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h3 className="font-semibold text-text-primary text-lg">Invitar al círculo</h3>
              <p className="text-xs text-text-secondary mt-1">Busca por nombre de usuario o email</p>
            </div>

            {/* Search input */}
            <div className="px-6 pb-3">
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nombre de usuario o email..."
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-[12px] text-sm text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[250px] overflow-y-auto px-4 pb-4">
              {searching && (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!searching && results.length > 0 && results.map(user => (
                <div key={user.userId} className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-background transition-colors">
                  <img src={getAvatarSrc(user.avatarId)} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{user.username}</p>
                    <p className="text-[11px] text-text-secondary truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleInvite(user)}
                    disabled={sending === user.userId}
                    className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-[8px] hover:bg-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {sending === user.userId ? '...' : 'Invitar'}
                  </button>
                </div>
              ))}

              {!searching && results.length === 0 && query.trim().length >= 2 && (
                <div className="text-center py-6">
                  <p className="text-text-secondary text-sm">No se encontraron usuarios</p>
                  {query.includes('@') && (
                    <button
                      onClick={handleEmailInvite}
                      disabled={sending === 'email'}
                      className="mt-3 px-4 py-2 bg-accent text-white text-sm rounded-[10px] hover:bg-accent-hover disabled:opacity-50"
                    >
                      {sending === 'email' ? '...' : `Invitar a ${query}`}
                    </button>
                  )}
                </div>
              )}

              {!searching && query.trim().length < 2 && (
                <p className="text-center text-text-secondary/50 text-xs py-6">Escribe al menos 2 caracteres</p>
              )}
            </div>

            {/* Close */}
            <div className="px-6 pb-5">
              <button onClick={onClose} className="w-full py-2.5 text-text-secondary text-sm font-medium hover:text-text-primary transition-colors">
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
