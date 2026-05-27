import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens, setUser } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const username = searchParams.get('username');
    const status = searchParams.get('status');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);

      if (userId && email) {
        setUser(userId, email, username || '');
      }

      // Clean URL to prevent token leakage
      window.history.replaceState({}, '', '/auth/callback');

      if (status === 'needs-username') {
        navigate('/choose-username', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      navigate('/login?error=auth-failed', { replace: true });
    }
  }, [searchParams, setTokens, setUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary text-sm">Autenticando...</p>
      </div>
    </div>
  );
}
