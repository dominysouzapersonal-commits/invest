import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Senhas não coincidem'); return; }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    setLoading(true);
    try { await register(email, password, name); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.detail || 'Erro ao criar conta'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-text-primary mb-1">InvestAnalytics</h1>
          <p className="text-sm text-text-muted">Criar conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-xs text-loss">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Nome"
            className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-faint focus:border-border-hover transition-colors" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email"
            className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-faint focus:border-border-hover transition-colors" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Senha"
            className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-faint focus:border-border-hover transition-colors" />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Confirmar senha"
            className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-faint focus:border-border-hover transition-colors" />
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-text-primary text-bg rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-40">
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          Já tem conta? <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
