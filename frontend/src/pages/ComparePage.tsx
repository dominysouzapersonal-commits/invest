import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GitCompareArrows, Plus, X } from 'lucide-react';
import { compareApi } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import Loading from '../components/common/Loading';
import { RECOMMENDATION_COLORS } from '../types';
import type { CompareResult } from '../types';

export default function ComparePage() {
  const [tickers, setTickers] = useState<string[]>(['', '']);
  const [results, setResults] = useState<CompareResult[] | null>(null);

  const compareMutation = useMutation({
    mutationFn: () => compareApi.compare(tickers.filter(Boolean)),
    onSuccess: setResults,
    onError: () => alert('Erro ao comparar ativos.'),
  });

  const addTicker = () => {
    if (tickers.length < 4) setTickers([...tickers, '']);
  };

  const removeTicker = (i: number) => {
    if (tickers.length > 2) setTickers(tickers.filter((_, idx) => idx !== i));
  };

  const updateTicker = (i: number, val: string) => {
    const next = [...tickers];
    next[i] = val.toUpperCase();
    setTickers(next);
  };

  const canCompare = tickers.filter(t => t.length >= 2).length >= 2;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Comparador de Ativos</h2>

      <Card className="mb-8">
        <p className="text-dark-muted text-sm mb-4">Selecione de 2 a 4 ativos para comparar lado a lado.</p>
        <div className="flex flex-wrap items-end gap-3">
          {tickers.map((t, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text" placeholder={`Ticker ${i + 1}`} value={t}
                onChange={e => updateTicker(i, e.target.value)}
                className="w-32 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500 uppercase"
              />
              {tickers.length > 2 && (
                <button onClick={() => removeTicker(i)} className="p-1 text-dark-muted hover:text-danger">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {tickers.length < 4 && (
            <button onClick={addTicker} className="p-2 border border-dashed border-dark-border rounded-lg text-dark-muted hover:text-white hover:border-primary-500 transition-colors">
              <Plus size={18} />
            </button>
          )}
          <button
            onClick={() => compareMutation.mutate()}
            disabled={!canCompare || compareMutation.isPending}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <GitCompareArrows size={16} /> Comparar
          </button>
        </div>
      </Card>

      {compareMutation.isPending && <Loading text="Analisando ativos..." />}

      {results && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-sm text-dark-muted font-medium">Ativo</th>
                <th className="text-center py-3 px-4 text-sm text-dark-muted font-medium">Score</th>
                <th className="text-center py-3 px-4 text-sm text-dark-muted font-medium">Recomendação</th>
                <th className="text-right py-3 px-4 text-sm text-dark-muted font-medium">Preço</th>
                <th className="text-right py-3 px-4 text-sm text-dark-muted font-medium">P/L</th>
                <th className="text-right py-3 px-4 text-sm text-dark-muted font-medium">P/VP</th>
                <th className="text-right py-3 px-4 text-sm text-dark-muted font-medium">ROE</th>
                <th className="text-right py-3 px-4 text-sm text-dark-muted font-medium">DY</th>
                <th className="text-right py-3 px-4 text-sm text-dark-muted font-medium">Dív/EBITDA</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.ticker} className={`border-b border-dark-border/50 ${i === 0 ? 'bg-primary-600/5' : ''}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-white font-semibold">{r.ticker}</p>
                        <p className="text-xs text-dark-muted">{r.name}</p>
                      </div>
                      <Badge type={r.asset_type} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <ScoreGauge score={r.score} size="sm" showLabel={false} />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-sm font-medium ${RECOMMENDATION_COLORS[r.recommendation] || 'text-white'}`}>
                      {r.recommendation}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-white">{r.price?.toFixed(2) ?? '—'}</td>
                  <td className="py-4 px-4 text-right text-white">{r.pe_ratio?.toFixed(2) ?? '—'}</td>
                  <td className="py-4 px-4 text-right text-white">{r.pb_ratio?.toFixed(2) ?? '—'}</td>
                  <td className="py-4 px-4 text-right text-white">{r.roe != null ? `${r.roe.toFixed(1)}%` : '—'}</td>
                  <td className="py-4 px-4 text-right text-white">{r.dividend_yield != null ? `${r.dividend_yield.toFixed(2)}%` : '—'}</td>
                  <td className="py-4 px-4 text-right text-white">{r.net_debt_ebitda?.toFixed(2) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
