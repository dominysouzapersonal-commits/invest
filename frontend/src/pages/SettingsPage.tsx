import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, RotateCcw } from 'lucide-react';
import { analysisApi } from '../services/api';
import Card from '../components/common/Card';
import type { ScoringWeights } from '../types';

const DEFAULT_WEIGHTS: ScoringWeights = {
  weight_valuation: 25,
  weight_profitability: 25,
  weight_dividends: 20,
  weight_debt: 20,
  weight_growth: 10,
};

const LABELS: Record<keyof ScoringWeights, string> = {
  weight_valuation: 'Valuation (P/L, P/VP, EV/EBITDA)',
  weight_profitability: 'Rentabilidade (ROE, ROA, Margens)',
  weight_dividends: 'Dividendos (DY, Payout)',
  weight_debt: 'Endividamento (Dív/EBITDA, Liq. Corrente)',
  weight_growth: 'Crescimento (Receita, Lucro)',
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
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const updateWeight = (key: keyof ScoringWeights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, val)) }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>

      <Card title="Pesos do Sistema de Scoring" subtitle="Defina a importância de cada categoria na nota final (total deve ser 100).">
        <div className="space-y-5">
          {(Object.keys(LABELS) as (keyof ScoringWeights)[]).map(key => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-dark-text">{LABELS[key]}</label>
                <span className="text-sm text-white font-mono w-12 text-right">{weights[key]}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={weights[key]}
                onChange={e => updateWeight(key, parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>
          ))}
        </div>

        <div className={`mt-6 flex items-center justify-between p-3 rounded-lg ${total === 100 ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'}`}>
          <span className={`font-medium ${total === 100 ? 'text-success' : 'text-danger'}`}>
            Total: {total}%
          </span>
          {total !== 100 && (
            <span className="text-sm text-danger">O total deve ser exatamente 100%</span>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={total !== 100}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            <Save size={16} /> {saved ? 'Salvo!' : 'Salvar'}
          </button>
          <button
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            className="px-5 py-2.5 border border-dark-border text-dark-text rounded-lg hover:bg-dark-border/50 transition-colors flex items-center gap-2 font-medium"
          >
            <RotateCcw size={16} /> Restaurar Padrão
          </button>
        </div>
      </Card>

      <Card title="Sobre" className="mt-6">
        <div className="space-y-3 text-sm text-dark-muted">
          <p><strong className="text-white">InvestAnalytics</strong> — Plataforma de Análise Fundamentalista</p>
          <p>Corretora: XP Investimentos</p>
          <p>Fontes de dados: brapi.dev, Yahoo Finance, Financial Modeling Prep, Fundamentus</p>
          <div className="pt-3 border-t border-dark-border">
            <p className="text-xs">
              Disclaimer: Esta ferramenta é para fins educacionais e informativos.
              Não constitui recomendação de investimento. Faça sua própria análise
              antes de tomar decisões financeiras.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
