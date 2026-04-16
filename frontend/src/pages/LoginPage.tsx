import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white tracking-tight">InvestAnalytics</h1>
          <p className="text-[15px] text-text-muted mt-3">Entre na sua conta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-loss/[0.08] border border-loss/20">
            <p className="text-[13px] text-loss">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
              placeholder="Senha"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-white text-black rounded-full text-[15px] font-semibold hover:bg-white/90 transition-all disabled:opacity-40 mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-text-muted uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-3.5 border border-border text-text-secondary rounded-full text-[15px] font-medium hover:text-white hover:border-border-hover transition-all flex items-center justify-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#888" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#888" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#888" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#888" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuar com Google
        </button>

        <p className="text-center text-[13px] text-text-muted mt-10">
          Não tem conta?{' '}
          <Link to="/register" className="text-white hover:underline underline-offset-4">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
