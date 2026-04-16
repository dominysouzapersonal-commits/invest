import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => assetsApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const popularAssets = [
    { ticker: 'PETR4', label: 'Petrobras' },
    { ticker: 'VALE3', label: 'Vale' },
    { ticker: 'ITUB4', label: 'Itaú' },
    { ticker: 'HGLG11', label: 'CSHG Log' },
    { ticker: 'AAPL', label: 'Apple' },
    { ticker: 'VOO', label: 'S&P 500' },
    { ticker: 'MSFT', label: 'Microsoft' },
    { ticker: 'AAPL34', label: 'Apple BDR' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Buscar ativo</h2>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ticker ou nome..."
          autoFocus
          className="w-full px-0 py-4 bg-transparent border-b border-border text-white placeholder-text-muted text-2xl text-center font-light focus:border-text-secondary tracking-wide"
        />
      </div>

      {isLoading && <Loading text="Buscando..." />}

      {results && results.length > 0 && (
        <div className="space-y-1">
          {results.map(asset => (
            <div
              key={asset.ticker}
              className="flex items-center justify-between py-4 px-4 -mx-4 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-all"
              onClick={() => navigate(`/asset/${asset.ticker}`)}
            >
              <div className="flex items-center gap-4">
                <span className="text-[15px] font-semibold text-white w-20">{asset.ticker}</span>
                <span className="text-[13px] text-text-secondary">{asset.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge type={asset.asset_type} />
                <span className="text-[11px] text-text-faint">{asset.exchange}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && debouncedQuery && (
        <p className="text-center text-text-muted text-[15px] py-12">
          Nenhum resultado para "{debouncedQuery}"
        </p>
      )}

      {!debouncedQuery && (
        <div>
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-6 text-center">Populares</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularAssets.map(a => (
              <div
                key={a.ticker}
                className="py-4 text-center cursor-pointer rounded-xl border border-border hover:border-border-hover hover:bg-white/[0.02] transition-all"
                onClick={() => navigate(`/asset/${a.ticker}`)}
              >
                <p className="text-[15px] font-semibold text-white">{a.ticker}</p>
                <p className="text-[12px] text-text-muted mt-1">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
