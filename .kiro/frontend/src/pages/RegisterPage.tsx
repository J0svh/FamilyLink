import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: { username?: string; email?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = 'El nombre es obligatorio';
    } else if (username.trim().length < 2) {
      errors.username = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!email.trim()) {
      errors.email = 'El correo es obligatorio';
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'Introduce un correo válido (ej: nombre@dominio.com)';
    }

    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'La contraseña debe contener letras y números';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { email: email.trim(), username: username.trim(), password });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.userId, data.email, data.username);
      navigate('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || '';

      if (status === 409 || msg.includes('already registered')) {
        setError('Este correo ya está registrado. ¿Quieres iniciar sesión?');
      } else if (status === 400) {
        setError(msg || 'Datos inválidos. Revisa los campos.');
      } else {
        setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-text-primary">FamilyLink</h1>
          <p className="mt-2 text-text-secondary">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-[16px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('auth.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setFieldErrors(f => ({ ...f, username: undefined })); }}
                maxLength={50}
                className={`w-full px-4 py-3 bg-background border rounded-[12px] text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.username ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="Tu nombre"
              />
              {fieldErrors.username && (
                <p className="text-xs text-error mt-1">{fieldErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
                className={`w-full px-4 py-3 bg-background border rounded-[12px] text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.email ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="tu@email.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-error mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
                className={`w-full px-4 py-3 bg-background border rounded-[12px] text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.password ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="Mínimo 8 caracteres con letras y números"
              />
              {fieldErrors.password && (
                <p className="text-xs text-error mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-error/10 border border-error/20 rounded-[10px] px-4 py-3"
              >
                <p className="text-sm text-error text-center">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-[12px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : t('auth.register')}
            </button>
          </form>
        </div>

        {/* Link to login */}
        <p className="text-center mt-6 text-sm text-text-secondary">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
