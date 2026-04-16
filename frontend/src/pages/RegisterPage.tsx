import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp size={32} className="text-primary-500" />
            <h1 className="text-2xl font-bold text-white">InvestAnalytics</h1>
          </div>
          <p className="text-dark-muted">Crie sua conta para começar</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-dark-muted mb-1">Nome</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
                placeholder="Seu nome"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-muted mb-1">Confirmar Senha</label>
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
                placeholder="Repita a senha"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus size={18} /> {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-sm text-dark-muted mt-6">
            Já tem conta? <Link to="/login" className="text-primary-400 hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
