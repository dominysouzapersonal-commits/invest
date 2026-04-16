import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp } from 'lucide-react';
import { assetsApi } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => assetsApi.search(searchTerm),
    enabled: searchTerm.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setSearchTerm(query.trim());
    }
  };

  const popularAssets = [
    { ticker: 'PETR4', label: 'Petrobras' },
    { ticker: 'VALE3', label: 'Vale' },
    { ticker: 'ITUB4', label: 'Itaú' },
    { ticker: 'HGLG11', label: 'CSHG Log' },
    { ticker: 'AAPL', label: 'Apple' },
    { ticker: 'VOO', label: 'Vanguard S&P500' },
    { ticker: 'MSFT', label: 'Microsoft' },
    { ticker: 'AAPL34', label: 'Apple BDR' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Buscar Ativo</h2>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={20} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Digite o ticker ou nome (ex: PETR4, AAPL, VOO, HGLG11...)"
            className="w-full pl-12 pr-4 py-4 bg-dark-card border border-dark-border rounded-xl text-white placeholder-dark-muted focus:outline-none focus:border-primary-500 text-lg"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Buscar
          </button>
        </div>
      </form>

      {isLoading && <Loading text="Buscando ativos..." />}

      {results && results.length > 0 && (
        <div className="space-y-3 mb-8">
          <h3 className="text-white font-medium mb-3">
            Resultados ({results.length})
          </h3>
          {results.map(asset => (
            <Card
              key={asset.ticker}
              className="cursor-pointer hover:border-primary-500/50 transition-colors"
            >
              <div
                className="flex items-center justify-between"
                onClick={() => navigate(`/asset/${asset.ticker}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{asset.ticker}</p>
                    <p className="text-sm text-dark-muted">{asset.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge type={asset.asset_type} />
                  <span className="text-xs text-dark-muted">{asset.exchange}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {results && results.length === 0 && searchTerm && (
        <Card className="text-center py-8">
          <p className="text-dark-muted">Nenhum ativo encontrado para "{searchTerm}"</p>
        </Card>
      )}

      {!searchTerm && (
        <div>
          <h3 className="text-white font-medium mb-4">Ativos Populares</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularAssets.map(a => (
              <Card
                key={a.ticker}
                className="cursor-pointer hover:border-primary-500/50 transition-colors text-center"
              >
                <div onClick={() => navigate(`/asset/${a.ticker}`)}>
                  <p className="text-white font-semibold">{a.ticker}</p>
                  <p className="text-xs text-dark-muted mt-1">{a.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
