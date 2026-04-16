import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { assetsApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => assetsApi.search(debounced),
    enabled: debounced.length >= 2,
  });

  const popular = [
    { t: 'PETR4', n: 'Petrobras' }, { t: 'VALE3', n: 'Vale' }, { t: 'ITUB4', n: 'Itaú' }, { t: 'HGLG11', n: 'CSHG Log' },
    { t: 'AAPL', n: 'Apple' }, { t: 'VOO', n: 'S&P 500' }, { t: 'MSFT', n: 'Microsoft' }, { t: 'AAPL34', n: 'Apple BDR' },
  ];

  return (
    <div className="max-w-xl mx-auto">
      <div className="relative mb-8">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)} autoFocus
          placeholder="Buscar ticker ou nome..."
          className="w-full pl-9 pr-3 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-faint focus:border-border-hover transition-colors"
        />
      </div>

      {isLoading && <Loading text="Buscando..." />}

      {results && results.length > 0 && (
        <div>
          {results.map(a => (
            <div key={a.ticker} onClick={() => navigate(`/asset/${a.ticker}`)}
              className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary w-16">{a.ticker}</span>
                <span className="text-xs text-text-secondary">{a.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge type={a.asset_type} />
                <span className="text-[10px] text-text-faint">{a.exchange}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {results?.length === 0 && debounced && (
        <p className="text-center text-xs text-text-muted py-10">Nenhum resultado para "{debounced}"</p>
      )}

      {!debounced && (
        <div>
          <p className="text-xs text-text-muted mb-3">Populares</p>
          <div className="grid grid-cols-4 gap-2">
            {popular.map(p => (
              <div key={p.t} onClick={() => navigate(`/asset/${p.t}`)}
                className="py-3 text-center border border-border rounded-lg cursor-pointer hover:bg-bg-hover hover:border-border-hover transition-colors">
                <p className="text-sm font-medium text-text-primary">{p.t}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{p.n}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
