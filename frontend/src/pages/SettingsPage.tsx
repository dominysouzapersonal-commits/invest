import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { analysisApi } from '../services/api';
import type { ScoringWeights } from '../types';

const DEFAULTS: ScoringWeights = { weight_valuation: 25, weight_profitability: 25, weight_dividends: 20, weight_debt: 20, weight_growth: 10 };
const LABELS: Record<keyof ScoringWeights, string> = { weight_valuation: 'Valuation', weight_profitability: 'Rentabilidade', weight_dividends: 'Dividendos', weight_debt: 'Endividamento', weight_growth: 'Crescimento' };

export default function SettingsPage() {
  const [w, setW] = useState<ScoringWeights>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const { data } = useQuery({ queryKey: ['scoring-weights'], queryFn: analysisApi.getWeights });
  useEffect(() => { if (data) setW(data); }, [data]);
  const save = useMutation({ mutationFn: () => analysisApi.updateWeights(w), onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); } });
  const total = Object.values(w).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-text-primary mb-6">Configurações</h2>
      <p className="text-xs text-text-muted mb-5">Pesos do scoring</p>
      <div className="space-y-5">
        {(Object.keys(LABELS) as (keyof ScoringWeights)[]).map(k => (
          <div key={k}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary">{LABELS[k]}</span>
              <span className="text-xs text-text-primary tabular-nums">{w[k]}%</span>
            </div>
            <input type="range" min={0} max={100} value={w[k]} onChange={e => setW(p => ({ ...p, [k]: parseInt(e.target.value) }))}
              className="w-full h-0.5 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:cursor-pointer" />
          </div>
        ))}
      </div>
      <div className={`mt-5 py-2 px-3 rounded-md text-xs ${total === 100 ? 'text-text-muted bg-bg-card' : 'text-loss bg-loss/5'}`}>
        Total: {total}%{total !== 100 && ' — deve ser 100%'}
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={() => save.mutate()} disabled={total !== 100}
          className="px-4 py-1.5 bg-text-primary text-bg rounded-md text-xs font-medium hover:bg-white disabled:opacity-30">{saved ? 'Salvo' : 'Salvar'}</button>
        <button onClick={() => setW(DEFAULTS)}
          className="px-4 py-1.5 border border-border text-text-secondary rounded-md text-xs hover:text-text-primary hover:border-border-hover">Restaurar</button>
      </div>
      <div className="border-t border-border mt-8 pt-6">
        <p className="text-xs text-text-muted">InvestAnalytics — Dados: brapi.dev, Yahoo Finance, FMP, Fundamentus.</p>
        <p className="text-[10px] text-text-faint mt-2">Ferramenta educacional. Não constitui recomendação de investimento.</p>
      </div>
    </div>
  );
}
