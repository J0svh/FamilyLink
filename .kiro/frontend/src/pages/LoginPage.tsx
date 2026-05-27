import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { SocialLoginButtons } from '../components/SocialLoginButtons';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth-failed': 'La autenticación falló. Inténtalo de nuevo.',
    'email-required': 'El proveedor no proporcionó un correo electrónico. Usa otro método.',
    'provider-unavailable': 'El proveedor no está disponible. Inténtalo más tarde.',
    'server-error': 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  };
  return messages[code] || 'Error de autenticación. Inténtalo de nuevo.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('error') ? getErrorMessage(searchParams.get('error')!) : '');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'El correo es obligatorio';
    else if (!isValidEmail(email.trim())) errors.email = 'Introduce un correo válido (ej: nombre@dominio.com)';
    if (!password) errors.password = 'La contraseña es obligatoria';
    else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.userId, data.email, data.username);
      navigate('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) setError('Email o contraseña incorrectos. Si no tienes cuenta, puedes crear una.');
      else if (status === 404) setError('No existe una cuenta con este correo. Crea una cuenta para empezar.');
      else if (status === 429) setError('Demasiados intentos. Espera unos minutos antes de volver a intentarlo.');
      else setError('No se pudo conectar con el servidor. Comprueba tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] animate-gradient" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-bold text-white mb-4">FamilyLink</h1>
            <p className="text-xl text-white/70 max-w-md">Comparte tu ubicación con las personas que más importan. Seguro, privado y en tiempo real.</p>
          </motion.div>
          {/* Floating elements */}
          <div className="absolute top-20 right-20 w-3 h-3 bg-accent rounded-full animate-ping opacity-50" />
          <div className="absolute bottom-32 left-16 w-2 h-2 bg-success rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white/10 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-3xl font-bold text-text-primary lg:hidden">FamilyLink</h1>
            <h2 className="text-2xl font-semibold text-text-primary hidden lg:block">Bienvenido de vuelta</h2>
            <p className="mt-2 text-text-secondary text-sm">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3.5 bg-surface border rounded-[14px] text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.email ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="tu@email.com"
              />
              {fieldErrors.email && <p className="text-xs text-error mt-1.5">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3.5 bg-surface border rounded-[14px] text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all ${fieldErrors.password ? 'border-error' : 'border-border focus:border-accent'}`}
                placeholder="••••••••"
              />
              {fieldErrors.password && <p className="text-xs text-error mt-1.5">{fieldErrors.password}</p>}
              <Link to="/forgot-password" className="block text-xs text-accent mt-2 hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-error/10 border border-error/20 rounded-[12px] px-4 py-3">
                <p className="text-sm text-error">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-[14px] transition-colors disabled:opacity-50">
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            {/* Social login */}
            <SocialLoginButtons />
          </form>

          <p className="text-center mt-8 text-sm text-text-secondary">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">Crear cuenta</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
