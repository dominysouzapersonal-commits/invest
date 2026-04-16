import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white tracking-tight">InvestAnalytics</h1>
          <p className="text-[15px] text-text-muted mt-3">Crie sua conta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-loss/[0.08] border border-loss/20">
            <p className="text-[13px] text-loss">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
            placeholder="Nome"
          />
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
            placeholder="Email"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
            placeholder="Senha"
          />
          <input
            type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
            className="w-full px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
            placeholder="Confirmar senha"
          />
          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-white text-black rounded-full text-[15px] font-semibold hover:bg-white/90 transition-all disabled:opacity-40 mt-2"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-[13px] text-text-muted mt-10">
          Já tem conta?{' '}
          <Link to="/login" className="text-white hover:underline underline-offset-4">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
