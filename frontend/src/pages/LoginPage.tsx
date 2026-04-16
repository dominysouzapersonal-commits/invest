import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Client ID não configurado');
      return;
    }
    const redirect = encodeURIComponent(window.location.origin + '/auth/google/callback');
    const scope = encodeURIComponent('email profile');
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=token&scope=${scope}`;
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp size={32} className="text-primary-500" />
            <h1 className="text-2xl font-bold text-white">InvestAnalytics</h1>
          </div>
          <p className="text-dark-muted">Faça login para acessar sua plataforma</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-dark-muted mb-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-muted mb-1">Senha</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
                placeholder="Sua senha"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn size={18} /> {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-xs text-dark-muted">ou</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-3 border border-dark-border text-dark-text rounded-lg hover:bg-dark-border/50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Entrar com Google
          </button>

          <p className="text-center text-sm text-dark-muted mt-6">
            Não tem conta? <Link to="/register" className="text-primary-400 hover:underline">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
