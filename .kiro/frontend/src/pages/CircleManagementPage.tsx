import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { OnboardingTutorial, CIRCLE_MANAGEMENT_ONBOARDING_STEPS } from '../components/OnboardingTutorial';

interface Member {
  userId: string;
  username: string;
  role: 'CIRCLE_ADMIN' | 'CIRCLE_MEMBER';
  joinedAt: string;
}

export default function CircleManagementPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // TODO: Load circle members from API
    // For now, placeholder
  }, [circleId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/circles/${circleId}/invitations`, { email: inviteEmail });
      setSuccess(`Invitación enviada a ${inviteEmail}`);
      setInviteEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al invitar');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    try {
      await api.delete(`/circles/${circleId}/members/${targetUserId}`);
      setMembers(members.filter((m) => m.userId !== targetUserId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar miembro');
    }
  };

  const handleChangeRole = async (targetUserId: string, newRole: 'CIRCLE_ADMIN' | 'CIRCLE_MEMBER') => {
    try {
      await api.patch(`/circles/${circleId}/members/${targetUserId}/role`, { role: newRole });
      setMembers(members.map((m) =>
        m.userId === targetUserId ? { ...m, role: newRole } : m,
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar rol');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTutorial
        steps={CIRCLE_MANAGEMENT_ONBOARDING_STEPS}
        storageKey="familylink-onboarding-circle-manage-done"
      />
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-accent font-medium text-sm"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Gestión del círculo</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Invite section */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-3">Invitar miembro</h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              placeholder="email@ejemplo.com"
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-[12px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <button
              type="submit"
              disabled={inviting}
              className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-[12px] transition-colors disabled:opacity-50"
            >
              {inviting ? '...' : 'Invitar'}
            </button>
          </form>
          {success && <p className="text-sm text-success mt-2">{success}</p>}
          {error && <p className="text-sm text-error mt-2">{error}</p>}
        </section>

        {/* Members list */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-3">Miembros</h2>
          <div className="space-y-2">
            {members.map((member) => (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface rounded-[14px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-accent font-semibold">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{member.username}</p>
                    <p className="text-xs text-text-secondary">
                      {member.role === 'CIRCLE_ADMIN' ? 'Admin' : 'Miembro'}
                    </p>
                  </div>
                </div>

                {/* Actions (only for admins, not self) */}
                {member.userId !== userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleChangeRole(
                        member.userId,
                        member.role === 'CIRCLE_ADMIN' ? 'CIRCLE_MEMBER' : 'CIRCLE_ADMIN',
                      )}
                      className="text-xs text-accent hover:underline"
                    >
                      {member.role === 'CIRCLE_ADMIN' ? 'Quitar admin' : 'Hacer admin'}
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-xs text-error hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {members.length === 0 && (
              <p className="text-text-secondary text-sm text-center py-8">
                Cargando miembros...
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
