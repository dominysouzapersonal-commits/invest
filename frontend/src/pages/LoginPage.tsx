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
    try { await login(email, password); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.detail || 'Erro ao fazer login'); }
    finally { setLoading(false); }
  };

  const handleGoogle = () => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!id) { setError('Google Client ID não configurado'); return; }
    const r = encodeURIComponent(window.location.origin + '/auth/google/callback');
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${id}&redirect_uri=${r}&response_type=token&scope=${encodeURIComponent('email profile')}`;
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-text-primary mb-1">InvestAnalytics</h1>
          <p className="text-sm text-text-muted">Entre na sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-xs text-loss">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email"
            className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-faint focus:border-border-hover transition-colors" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Senha"
            className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-faint focus:border-border-hover transition-colors" />
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-text-primary text-bg rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-40">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-text-faint">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button onClick={handleGoogle}
          className="w-full py-2 border border-border text-text-secondary rounded-lg text-sm hover:text-text-primary hover:border-border-hover transition-colors flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#666" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#666" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#666" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#666" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>

        <p className="text-center text-xs text-text-muted mt-6">
          Sem conta? <Link to="/register" className="text-text-secondary hover:text-text-primary transition-colors">Criar</Link>
        </p>
      </div>
    </div>
  );
}
