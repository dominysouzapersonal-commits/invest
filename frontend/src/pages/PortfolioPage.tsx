import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Plus, X, RefreshCw, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { portfolioApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

const REFRESH_INTERVAL_MS = 60_000;

// Carteira recomendada — espelha docs/RELATORIO_COMPLETO.md (revisão 23/04/2026)
const RECOMMENDED_PORTFOLIO: Array<{
  ticker: string;
  asset_type: string;
  quantity: number;
  avg_price: number;
}> = [
  { ticker: 'INTB3', asset_type: 'br_stock', quantity: 76, avg_price: 15.30 },
  { ticker: 'SUZB3', asset_type: 'br_stock', quantity: 25, avg_price: 47.35 },
  { ticker: 'BBSE3', asset_type: 'br_stock', quantity: 20, avg_price: 34.70 },
  { ticker: 'ITUB4', asset_type: 'br_stock', quantity: 14, avg_price: 45.03 },
  { ticker: 'MXRF11', asset_type: 'fii', quantity: 68, avg_price: 9.92 },
  { ticker: 'KNCR11', asset_type: 'fii', quantity: 6, avg_price: 106.98 },
  { ticker: 'NASD11', asset_type: 'br_etf', quantity: 54, avg_price: 18.67 },
];

const fmtBRL = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (n: number | null | undefined) =>
  n == null ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function PortfolioPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', asset_type: 'br_stock', quantity: '', avg_price: '' });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { data: summary, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: async () => {
      const r = await portfolioApi.getSummary();
      setLastRefresh(new Date());
      return r;
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const importMut = useMutation({
    mutationFn: (f: File) => portfolioApi.importFile(f),
    onSuccess: (d) => { alert(d.message); qc.invalidateQueries({ queryKey: ['portfolio-summary'] }); },
  });

  const createMut = useMutation({
    mutationFn: () =>
      portfolioApi.createPosition({
        ticker: form.ticker.toUpperCase(),
        asset_type: form.asset_type,
        quantity: parseFloat(form.quantity),
        avg_price: parseFloat(form.avg_price),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-summary'] });
      setForm({ ticker: '', asset_type: 'br_stock', quantity: '', avg_price: '' });
      setShowForm(false);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => portfolioApi.deletePosition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio-summary'] }),
  });

  const importRecommendedMut = useMutation({
    mutationFn: async () => {
      const existing = new Set((summary?.positions ?? []).map(p => p.ticker.toUpperCase()));
      const toInsert = RECOMMENDED_PORTFOLIO.filter(r => !existing.has(r.ticker.toUpperCase()));
      let created = 0;
      const skipped: string[] = [];
      for (const row of toInsert) {
        try {
          await portfolioApi.createPosition(row);
          created += 1;
        } catch {
          skipped.push(row.ticker);
        }
      }
      return { created, skipped, alreadyPresent: RECOMMENDED_PORTFOLIO.length - toInsert.length };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['portfolio-summary'] });
      const parts = [`${r.created} posições adicionadas`];
      if (r.alreadyPresent > 0) parts.push(`${r.alreadyPresent} já existiam`);
      if (r.skipped.length > 0) parts.push(`falhou: ${r.skipped.join(', ')}`);
      alert(parts.join(' • '));
    },
  });

  if (isLoading) return <Loading />;

  const positions = summary?.positions ?? [];
  const isPositive = (summary?.total_profit_loss ?? 0) >= 0;
  const updatedSecondsAgo = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Portfolio</h2>
          <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5">
            <RefreshCw size={10} className={isFetching ? 'animate-spin' : ''} />
            Atualiza a cada 60s · última atualização há {updatedSecondsAgo}s
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar agora"
            className="px-3 py-1.5 border border-border text-xs text-text-secondary rounded-md hover:text-text-primary hover:border-border-hover transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} /> Atualizar
          </button>
          <button
            onClick={() => importRecommendedMut.mutate()}
            disabled={importRecommendedMut.isPending}
            className="px-3 py-1.5 border border-border text-xs text-text-secondary rounded-md hover:text-text-primary hover:border-border-hover transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Sparkles size={12} /> Importar carteira recomendada
          </button>
          <label className="px-3 py-1.5 border border-border text-xs text-text-secondary rounded-md cursor-pointer hover:text-text-primary hover:border-border-hover transition-colors flex items-center gap-1.5">
            <Upload size={12} /> Importar XP
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importMut.mutate(f); }} />
          </label>
          <button onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-text-primary text-bg rounded-md text-xs font-medium hover:bg-white transition-colors flex items-center gap-1.5">
            <Plus size={12} /> Adicionar
          </button>
        </div>
      </div>

      {summary && positions.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Investido</p>
            <p className="text-lg font-semibold text-text-primary mt-1 tabular-nums">{fmtBRL(summary.total_invested)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Valor atual</p>
            <p className="text-lg font-semibold text-text-primary mt-1 tabular-nums">{fmtBRL(summary.total_current)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Resultado</p>
            <p className={`text-lg font-semibold mt-1 tabular-nums flex items-center gap-1.5 ${isPositive ? 'text-profit' : 'text-loss'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {fmtBRL(summary.total_profit_loss)}
            </p>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Rentabilidade</p>
            <p className={`text-lg font-semibold mt-1 tabular-nums ${isPositive ? 'text-profit' : 'text-loss'}`}>
              {fmtPct(summary.total_profit_loss_pct)}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-bg-card border border-border rounded-lg p-4 mb-6 grid grid-cols-5 gap-3">
          <input type="text" placeholder="Ticker" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <select value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary focus:border-border-hover">
            <option value="br_stock" className="bg-bg">Ação BR</option>
            <option value="fii" className="bg-bg">FII</option>
            <option value="br_etf" className="bg-bg">ETF BR</option>
            <option value="us_stock" className="bg-bg">Ação US</option>
            <option value="us_etf" className="bg-bg">ETF US</option>
            <option value="bdr" className="bg-bg">BDR</option>
          </select>
          <input type="number" placeholder="Qtd" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <input type="number" placeholder="PM" value={form.avg_price} onChange={e => setForm({ ...form, avg_price: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <button onClick={() => createMut.mutate()} disabled={!form.ticker || !form.quantity || !form.avg_price}
            className="py-2 bg-text-primary text-bg rounded-md text-sm font-medium hover:bg-white disabled:opacity-30">Salvar</button>
        </div>
      )}

      {positions.length > 0 ? (
        <div>
          <div className="grid grid-cols-[1fr_80px_70px_90px_100px_110px_140px_30px] gap-3 px-3 py-2 text-[11px] text-text-muted">
            <span>Ticker</span>
            <span>Tipo</span>
            <span className="text-right">Qtd</span>
            <span className="text-right">PM</span>
            <span className="text-right">Atual</span>
            <span className="text-right">Valor</span>
            <span className="text-right">P&L</span>
            <span />
          </div>
          {positions.map(p => {
            const pl = p.profit_loss ?? null;
            const plPct = p.profit_loss_pct ?? null;
            const positive = (pl ?? 0) >= 0;
            return (
              <div key={p.id} className="grid grid-cols-[1fr_80px_70px_90px_100px_110px_140px_30px] gap-3 items-center py-2.5 px-3 -mx-3 rounded-lg hover:bg-bg-hover transition-colors">
                <span className="text-sm font-medium text-text-primary">{p.ticker}</span>
                <Badge type={p.asset_type} />
                <span className="text-sm text-text-primary text-right tabular-nums">{p.quantity}</span>
                <span className="text-sm text-text-primary text-right tabular-nums">{fmtBRL(p.avg_price)}</span>
                <span className="text-sm text-text-secondary text-right tabular-nums">{fmtBRL(p.current_price)}</span>
                <span className="text-sm text-text-primary text-right tabular-nums">{fmtBRL(p.current_value ?? p.quantity * p.avg_price)}</span>
                <span className={`text-sm text-right tabular-nums ${pl == null ? 'text-text-muted' : positive ? 'text-profit' : 'text-loss'}`}>
                  {pl == null ? '—' : `${fmtBRL(pl)} (${fmtPct(plPct)})`}
                </span>
                <div className="text-right">
                  <button onClick={() => { if (confirm('Remover?')) delMut.mutate(p.id); }} className="p-1 text-text-faint hover:text-loss"><X size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xs text-text-muted mb-4">Nenhuma posição ainda.</p>
          <button
            onClick={() => importRecommendedMut.mutate()}
            disabled={importRecommendedMut.isPending}
            className="px-4 py-2 bg-text-primary text-bg rounded-md text-xs font-medium hover:bg-white transition-colors inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Sparkles size={12} /> Importar carteira recomendada (7 ativos)
          </button>
        </div>
      )}
    </div>
  );
}
