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
  const mut = useMutation({ mutationFn: () => compareApi.compare(tickers.filter(Boolean)), onSuccess: setResults });

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-6">Comparador</h2>
      <div className="flex flex-wrap items-end gap-2 mb-8">
        {tickers.map((t, i) => (
          <div key={i} className="flex items-center gap-1">
            <input type="text" placeholder={`#${i + 1}`} value={t} onChange={e => { const n = [...tickers]; n[i] = e.target.value.toUpperCase(); setTickers(n); }}
              className="w-24 px-3 py-2 bg-bg-card border border-border rounded-md text-sm text-text-primary text-center uppercase placeholder-text-faint focus:border-border-hover" />
            {tickers.length > 2 && <button onClick={() => setTickers(tickers.filter((_, j) => j !== i))} className="p-0.5 text-text-faint hover:text-loss"><X size={12} /></button>}
          </div>
        ))}
        {tickers.length < 4 && <button onClick={() => setTickers([...tickers, ''])} className="p-2 border border-dashed border-border rounded-md text-text-muted hover:text-text-primary hover:border-border-hover"><Plus size={14} /></button>}
        <button onClick={() => mut.mutate()} disabled={tickers.filter(t => t.length >= 2).length < 2 || mut.isPending}
          className="px-4 py-2 bg-text-primary text-bg rounded-md text-xs font-medium hover:bg-white disabled:opacity-30 ml-2">Comparar</button>
      </div>

      {mut.isPending && <Loading text="Analisando..." />}

      {results && results.length > 0 && (
        <div>
          <div className="grid grid-cols-9 gap-3 px-3 py-2 text-[11px] text-text-muted">
            {['Ativo', 'Score', 'Recom.', 'Preço', 'P/L', 'P/VP', 'ROE', 'DY', 'Dív/EBITDA'].map(h => <span key={h}>{h}</span>)}
          </div>
          {results.map((r, i) => (
            <div key={r.ticker} className={`grid grid-cols-9 gap-3 items-center py-2.5 px-3 -mx-3 rounded-lg ${i === 0 ? 'bg-bg-hover' : ''}`}>
              <div><p className="text-sm font-medium text-text-primary">{r.ticker}</p><Badge type={r.asset_type} /></div>
              <ScoreGauge score={r.score} size="sm" showLabel={false} />
              <span className={`text-xs ${r.score >= 60 ? 'text-text-primary' : r.score >= 40 ? 'text-text-secondary' : 'text-loss'}`}>{r.recommendation}</span>
              <span className="text-sm text-text-primary tabular-nums">{r.price?.toFixed(2) ?? '—'}</span>
              <span className="text-sm text-text-primary tabular-nums">{r.pe_ratio?.toFixed(1) ?? '—'}</span>
              <span className="text-sm text-text-primary tabular-nums">{r.pb_ratio?.toFixed(2) ?? '—'}</span>
              <span className="text-sm text-text-primary tabular-nums">{r.roe != null ? `${r.roe.toFixed(1)}%` : '—'}</span>
              <span className="text-sm text-text-primary tabular-nums">{r.dividend_yield != null ? `${r.dividend_yield.toFixed(2)}%` : '—'}</span>
              <span className="text-sm text-text-primary tabular-nums">{r.net_debt_ebitda?.toFixed(2) ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
