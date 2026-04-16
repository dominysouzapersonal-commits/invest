import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { compareApi } from '../services/api';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import Loading from '../components/common/Loading';
import type { CompareResult } from '../types';

export default function ComparePage() {
  const [tickers, setTickers] = useState<string[]>(['', '']);
  const [results, setResults] = useState<CompareResult[] | null>(null);

  const compareMutation = useMutation({
    mutationFn: () => compareApi.compare(tickers.filter(Boolean)),
    onSuccess: setResults,
  });

  const addTicker = () => { if (tickers.length < 4) setTickers([...tickers, '']); };
  const removeTicker = (i: number) => { if (tickers.length > 2) setTickers(tickers.filter((_, idx) => idx !== i)); };
  const updateTicker = (i: number, val: string) => { const n = [...tickers]; n[i] = val.toUpperCase(); setTickers(n); };

  const canCompare = tickers.filter(t => t.length >= 2).length >= 2;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white tracking-tight mb-10">Comparador</h2>

      <div className="flex flex-wrap items-end gap-3 mb-12">
        {tickers.map((t, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="text" placeholder={`Ticker ${i + 1}`} value={t}
              onChange={e => updateTicker(i, e.target.value)}
              className="w-28 px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] text-center uppercase focus:border-text-secondary"
            />
            {tickers.length > 2 && (
              <button onClick={() => removeTicker(i)} className="p-1 text-text-faint hover:text-loss">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {tickers.length < 4 && (
          <button onClick={addTicker} className="pb-3 border-b border-dashed border-border text-text-muted hover:text-white hover:border-border-hover transition-all px-3">
            <Plus size={16} />
          </button>
        )}
        <button
          onClick={() => compareMutation.mutate()}
          disabled={!canCompare || compareMutation.isPending}
          className="px-6 py-3 bg-white text-black rounded-full text-[13px] font-semibold hover:bg-white/90 disabled:opacity-30 transition-all ml-4"
        >
          Comparar
        </button>
      </div>

      {compareMutation.isPending && <Loading text="Analisando..." />}

      {results && results.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-9 gap-4 px-4 py-2">
            {['Ativo', 'Score', 'Recomendação', 'Preço', 'P/L', 'P/VP', 'ROE', 'DY', 'Dív/EBITDA'].map(h => (
              <span key={h} className="text-[11px] text-text-muted uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {results.map((r, i) => (
            <div key={r.ticker} className={`grid grid-cols-9 gap-4 items-center py-4 px-4 -mx-4 rounded-xl ${i === 0 ? 'bg-white/[0.02]' : ''}`}>
              <div>
                <p className="text-[15px] font-semibold text-white">{r.ticker}</p>
                <Badge type={r.asset_type} />
              </div>
              <ScoreGauge score={r.score} size="sm" showLabel={false} />
              <span className={`text-[13px] font-medium ${r.score >= 60 ? 'text-text-primary' : r.score >= 40 ? 'text-text-secondary' : 'text-loss'}`}>
                {r.recommendation}
              </span>
              <span className="text-[15px] text-white tabular-nums">{r.price?.toFixed(2) ?? '—'}</span>
              <span className="text-[15px] text-white tabular-nums">{r.pe_ratio?.toFixed(1) ?? '—'}</span>
              <span className="text-[15px] text-white tabular-nums">{r.pb_ratio?.toFixed(2) ?? '—'}</span>
              <span className="text-[15px] text-white tabular-nums">{r.roe != null ? `${r.roe.toFixed(1)}%` : '—'}</span>
              <span className="text-[15px] text-white tabular-nums">{r.dividend_yield != null ? `${r.dividend_yield.toFixed(2)}%` : '—'}</span>
              <span className="text-[15px] text-white tabular-nums">{r.net_debt_ebitda?.toFixed(2) ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
