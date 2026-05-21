import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default function RegisterPage() {
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
    if (!username.trim()) errors.username = 'El nombre es obligatorio';
    else if (username.trim().length < 2) errors.username = 'Mínimo 2 caracteres';
    if (!email.trim()) errors.email = 'El correo es obligatorio';
    else if (!isValidEmail(email.trim())) errors.email = 'Introduce un correo válido';
    if (!password) errors.password = 'La contraseña es obligatoria';
    else if (password.length < 8) errors.password = 'Mínimo 8 caracteres';
    else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) errors.password = 'Debe contener letras y números';
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
      if (status === 409) setError('Este correo ya está registrado. ¿Quieres iniciar sesión?');
      else if (status === 400) setError(err.response?.data?.message || 'Datos inválidos');
      else setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#24243e] via-[#302b63] to-[#0f0c29] animate-gradient" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-bold text-white mb-4">FamilyLink</h1>
            <p className="text-xl text-white/70 max-w-md">Únete a tu familia en el mapa. Crea círculos, comparte ubicación y mantente conectado.</p>
          </motion.div>
          <div className="absolute top-16 left-20 w-3 h-3 bg-success rounded-full animate-ping opacity-50" />
          <div className="absolute bottom-24 right-16 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary lg:hidden">FamilyLink</h1>
            <h2 className="text-2xl font-semibold text-text-primary hidden lg:block">Crear cuenta</h2>
            <p className="mt-2 text-text-secondary text-sm">Únete a tu familia en el mapa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Nombre de usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setFieldErrors(f => ({ ...f, username: undefined })); }}
                maxLength={50}
                className={`w-full px-4 py-3.5 bg-surface border rounded-[14px] text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.username ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="Tu nombre"
              />
              {fieldErrors.username && <p className="text-xs text-error mt-1.5">{fieldErrors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
                className={`w-full px-4 py-3.5 bg-surface border rounded-[14px] text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.email ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="tu@email.com"
              />
              {fieldErrors.email && <p className="text-xs text-error mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
                className={`w-full px-4 py-3.5 bg-surface border rounded-[14px] text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.password ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="Mínimo 8 caracteres con letras y números"
              />
              {fieldErrors.password && <p className="text-xs text-error mt-1.5">{fieldErrors.password}</p>}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-error/10 border border-error/20 rounded-[12px] px-4 py-3">
                <p className="text-sm text-error">{error}</p>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[14px] transition-colors disabled:opacity-50">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-text-secondary">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">Iniciar sesión</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
