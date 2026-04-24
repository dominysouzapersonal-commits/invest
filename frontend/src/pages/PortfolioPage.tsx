import { useQuery } from '@tanstack/react-query';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { portfolioApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

const REFRESH_INTERVAL_MS = 60_000;

// Carteira fixa — espelha docs/RELATORIO_COMPLETO.md (revisão 23/04/2026)
const PORTFOLIO: Array<{
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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['portfolio-quotes-bulk'],
    queryFn: async () => {
      const r = await portfolioApi.getQuotesBulk(PORTFOLIO.map(p => p.ticker));
      setLastRefresh(new Date());
      return r;
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <Loading />;

  const prices = data?.prices ?? {};

  const rows = PORTFOLIO.map(p => {
    const current_price = prices[p.ticker] ?? null;
    const invested = p.quantity * p.avg_price;
    const current_value = current_price != null ? p.quantity * current_price : invested;
    const profit_loss = current_price != null ? current_value - invested : null;
    const profit_loss_pct = current_price != null ? ((current_price - p.avg_price) / p.avg_price) * 100 : null;
    return { ...p, current_price, invested, current_value, profit_loss, profit_loss_pct };
  });

  const total_invested = rows.reduce((s, r) => s + r.invested, 0);
  const total_current = rows.reduce((s, r) => s + r.current_value, 0);
  const total_profit_loss = total_current - total_invested;
  const total_profit_loss_pct = total_invested > 0 ? (total_profit_loss / total_invested) * 100 : 0;
  const isPositive = total_profit_loss >= 0;
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
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-3 py-1.5 border border-border text-xs text-text-secondary rounded-md hover:text-text-primary hover:border-border-hover transition-colors flex items-center gap-1.5 disabled:opacity-40"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Investido</p>
          <p className="text-lg font-semibold text-text-primary mt-1 tabular-nums">{fmtBRL(total_invested)}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Valor atual</p>
          <p className="text-lg font-semibold text-text-primary mt-1 tabular-nums">{fmtBRL(total_current)}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Resultado</p>
          <p className={`text-lg font-semibold mt-1 tabular-nums flex items-center gap-1.5 ${isPositive ? 'text-profit' : 'text-loss'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {fmtBRL(total_profit_loss)}
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Rentabilidade</p>
          <p className={`text-lg font-semibold mt-1 tabular-nums ${isPositive ? 'text-profit' : 'text-loss'}`}>
            {fmtPct(total_profit_loss_pct)}
          </p>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-[1fr_80px_70px_90px_100px_110px_140px] gap-3 px-3 py-2 text-[11px] text-text-muted">
          <span>Ticker</span>
          <span>Tipo</span>
          <span className="text-right">Qtd</span>
          <span className="text-right">PM</span>
          <span className="text-right">Atual</span>
          <span className="text-right">Valor</span>
          <span className="text-right">P&L</span>
        </div>
        {rows.map(r => {
          const positive = (r.profit_loss ?? 0) >= 0;
          return (
            <div key={r.ticker} className="grid grid-cols-[1fr_80px_70px_90px_100px_110px_140px] gap-3 items-center py-2.5 px-3 -mx-3 rounded-lg hover:bg-bg-hover transition-colors">
              <span className="text-sm font-medium text-text-primary">{r.ticker}</span>
              <Badge type={r.asset_type} />
              <span className="text-sm text-text-primary text-right tabular-nums">{r.quantity}</span>
              <span className="text-sm text-text-primary text-right tabular-nums">{fmtBRL(r.avg_price)}</span>
              <span className="text-sm text-text-secondary text-right tabular-nums">{fmtBRL(r.current_price)}</span>
              <span className="text-sm text-text-primary text-right tabular-nums">{fmtBRL(r.current_value)}</span>
              <span className={`text-sm text-right tabular-nums ${r.profit_loss == null ? 'text-text-muted' : positive ? 'text-profit' : 'text-loss'}`}>
                {r.profit_loss == null ? '—' : `${fmtBRL(r.profit_loss)} (${fmtPct(r.profit_loss_pct)})`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
