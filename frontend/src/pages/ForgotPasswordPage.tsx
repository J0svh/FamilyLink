import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Introduce tu correo'); return; }
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Recuperar contraseña</h1>
          <p className="mt-2 text-text-secondary text-sm">Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-success/10 border border-success/20 rounded-[16px] p-6 text-center">
            <p className="text-4xl mb-3">📧</p>
            <p className="text-text-primary font-medium">¡Revisa tu correo!</p>
            <p className="text-sm text-text-secondary mt-2">Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.</p>
            <Link to="/login" className="inline-block mt-5 text-accent font-medium text-sm hover:underline">Volver al login</Link>
          </motion.div>
        ) : (
          <div className="bg-surface rounded-[16px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full px-4 py-3.5 bg-background border border-border rounded-[14px] text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  placeholder="tu@email.com"
                  autoFocus
                />
                {error && <p className="text-xs text-error mt-1.5">{error}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[14px] transition-colors disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center mt-6 text-sm text-text-secondary">
          <Link to="/login" className="text-accent font-medium hover:underline">← Volver al login</Link>
        </p>
      </motion.div>
    </div>
  );
}
