import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

export default function GoogleCallbackPage() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('access_token');

    if (!accessToken) {
      setError('Token do Google não encontrado');
      return;
    }

    googleLogin(accessToken)
      .then(() => navigate('/'))
      .catch(() => setError('Erro ao autenticar com Google'));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <button onClick={() => navigate('/login')} className="text-primary-400 hover:underline">
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <Loading text="Autenticando com Google..." />
    </div>
  );
}
