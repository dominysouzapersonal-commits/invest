import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { analysisApi } from '../services/api';
import type { ScoringWeights } from '../types';

const DEFAULT_WEIGHTS: ScoringWeights = {
  weight_valuation: 25,
  weight_profitability: 25,
  weight_dividends: 20,
  weight_debt: 20,
  weight_growth: 10,
};

const LABELS: Record<keyof ScoringWeights, string> = {
  weight_valuation: 'Valuation',
  weight_profitability: 'Rentabilidade',
  weight_dividends: 'Dividendos',
  weight_debt: 'Endividamento',
  weight_growth: 'Crescimento',
};

export default function SettingsPage() {
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [saved, setSaved] = useState(false);

  const { data: serverWeights } = useQuery({
    queryKey: ['scoring-weights'],
    queryFn: analysisApi.getWeights,
  });

  useEffect(() => {
    if (serverWeights) setWeights(serverWeights);
  }, [serverWeights]);

  const saveMutation = useMutation({
    mutationFn: () => analysisApi.updateWeights(weights),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const updateWeight = (key: keyof ScoringWeights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, val)) }));
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-white tracking-tight mb-10">Configurações</h2>

      <div className="mb-12">
        <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-8">Pesos do Scoring</h3>

        <div className="space-y-8">
          {(Object.keys(LABELS) as (keyof ScoringWeights)[]).map(key => (
            <div key={key}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] text-text-secondary">{LABELS[key]}</span>
                <span className="text-[14px] text-white font-medium tabular-nums">{weights[key]}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={weights[key]}
                onChange={e => updateWeight(key, parseInt(e.target.value))}
                className="w-full h-1 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className={`mt-8 py-3 px-4 rounded-xl text-[13px] ${total === 100 ? 'text-text-secondary bg-white/[0.03]' : 'text-loss bg-loss/[0.06]'}`}>
          Total: {total}%{total !== 100 && ' — deve ser 100%'}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={total !== 100}
            className="px-6 py-3 bg-white text-black rounded-full text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 transition-all"
          >
            {saved ? 'Salvo' : 'Salvar'}
          </button>
          <button
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            className="px-6 py-3 border border-border text-text-secondary rounded-full text-[14px] font-medium hover:text-white hover:border-border-hover transition-all"
          >
            Restaurar
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-4">Sobre</h3>
        <p className="text-[13px] text-text-muted leading-relaxed">
          InvestAnalytics — Plataforma de Análise Fundamentalista.
          Dados: brapi.dev, Yahoo Finance, Financial Modeling Prep, Fundamentus.
        </p>
        <p className="text-[11px] text-text-faint mt-4">
          Esta ferramenta é para fins educacionais. Não constitui recomendação de investimento.
        </p>
      </div>
    </div>
  );
}
