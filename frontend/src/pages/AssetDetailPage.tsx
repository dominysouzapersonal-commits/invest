import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { assetsApi, watchlistApi } from '../services/api';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import MetricCard from '../components/common/MetricCard';
import Loading from '../components/common/Loading';

export default function AssetDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['asset', ticker],
    queryFn: () => assetsApi.getDetail(ticker!),
    enabled: !!ticker,
  });

  if (isLoading) return <Loading text={`Analisando ${ticker}...`} />;
  if (error || !data) {
    return (
      <div className="text-center py-24">
        <p className="text-loss mb-4">Erro ao carregar {ticker}</p>
        <button onClick={() => navigate('/search')} className="text-text-secondary hover:text-white text-[14px]">
          Voltar
        </button>
      </div>
    );
  }

  const { fundamentals: f, historical_prices: prices, score } = data;
  const isPositive = (f.change_percent ?? 0) >= 0;

  const handleAddWatchlist = async () => {
    try {
      await watchlistApi.add({ ticker: f.ticker, asset_type: f.asset_type });
    } catch { /* already in watchlist */ }
  };

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-white text-[13px] mb-10 transition-colors">
        <ArrowLeft size={14} /> Voltar
      </button>

      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl font-bold text-white tracking-tight">{f.ticker}</h1>
            <Badge type={f.asset_type} />
          </div>
          <p className="text-text-secondary text-[15px]">{f.name}</p>
          {f.sector && <p className="text-text-muted text-[13px] mt-1">{f.sector}{f.industry ? ` · ${f.industry}` : ''}</p>}

          <div className="flex items-end gap-4 mt-6">
            <span className="text-5xl font-bold text-white tabular-nums tracking-tight">
              {f.currency === 'BRL' ? 'R$' : '$'}{f.price?.toFixed(2) ?? '—'}
            </span>
            <span className={`flex items-center gap-1 text-[17px] font-medium pb-1 ${isPositive ? 'text-gain' : 'text-loss'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {f.change_percent?.toFixed(2)}%
            </span>
          </div>
          {f.market_cap && (
            <p className="text-text-muted text-[13px] mt-2">
              Cap: {f.currency === 'BRL' ? 'R$' : '$'}{(f.market_cap / 1e9).toFixed(1)}B
            </p>
          )}
        </div>

        {/* Score + actions */}
        <div className="flex items-center gap-8">
          {score && (
            <div className="text-center">
              <ScoreGauge score={score.total_score} size="lg" />
              <p className={`text-[13px] font-medium mt-2 ${score.total_score >= 60 ? 'text-text-primary' : score.total_score >= 40 ? 'text-text-secondary' : 'text-loss'}`}>
                {score.recommendation}
              </p>
            </div>
          )}
          <button
            onClick={handleAddWatchlist}
            className="px-5 py-2.5 border border-border text-text-secondary rounded-full text-[13px] font-medium hover:text-white hover:border-border-hover transition-all"
          >
            + Watchlist
          </button>
        </div>
      </div>

      {/* Price chart */}
      {prices.length > 0 && (
        <div className="mb-16">
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-6">Preço 1 Ano</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={prices}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fafafa" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#fafafa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date" tick={{ fill: '#3f3f46', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fill: '#3f3f46', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111113', border: '1px solid #1c1c1e', borderRadius: 12, fontSize: 13, color: '#fafafa' }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#fafafa' }}
              />
              <Area type="monotone" dataKey="close" stroke="#fafafa" fill="url(#priceGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Score breakdown */}
      {score && (
        <div className="mb-16">
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-6">Score Detalhado</h3>
          <div className="grid grid-cols-5 gap-8 mb-10">
            {[
              { label: 'Valuation', s: score.valuation_score },
              { label: 'Rentabilidade', s: score.profitability_score },
              { label: 'Dividendos', s: score.dividends_score },
              { label: 'Endividamento', s: score.debt_score },
              { label: 'Crescimento', s: score.growth_score },
            ].map(item => (
              <div key={item.label} className="text-center">
                <ScoreGauge score={item.s} size="sm" showLabel={false} />
                <p className="text-[11px] text-text-muted mt-3">{item.label}</p>
              </div>
            ))}
          </div>

          {Object.entries(score.details).map(([category, metrics]) => (
            <div key={category} className="mb-6">
              <p className="text-[11px] text-text-muted uppercase tracking-widest mb-3">{category}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-1">
                {Object.entries(metrics).map(([name, m]) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-[12px] text-text-muted">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-white tabular-nums font-medium">
                        {typeof m.value === 'number' ? m.value.toFixed(2) : m.value}
                      </span>
                      <span className={`text-[10px] tabular-nums ${m.score >= 65 ? 'text-gain' : m.score >= 40 ? 'text-text-muted' : 'text-loss'}`}>
                        {m.score.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analyst / Advanced */}
      {(f.recommendation_key || f.altman_z_score != null || f.piotroski_score != null) && (
        <div className="grid grid-cols-3 gap-8 mb-16">
          {f.recommendation_key && (
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-widest mb-2">Analistas</p>
              <p className="text-2xl font-bold text-white capitalize">{f.recommendation_key}</p>
              {f.target_mean_price && <p className="text-[13px] text-text-muted mt-1">Alvo: {f.currency === 'BRL' ? 'R$' : '$'}{f.target_mean_price.toFixed(2)}</p>}
            </div>
          )}
          {f.piotroski_score != null && (
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-widest mb-2">Piotroski</p>
              <p className={`text-2xl font-bold ${f.piotroski_score >= 7 ? 'text-gain' : f.piotroski_score >= 4 ? 'text-text-primary' : 'text-loss'}`}>
                {f.piotroski_score}/9
              </p>
            </div>
          )}
          {f.altman_z_score != null && (
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-widest mb-2">Altman Z</p>
              <p className={`text-2xl font-bold ${f.altman_z_score > 2.99 ? 'text-gain' : f.altman_z_score > 1.81 ? 'text-text-primary' : 'text-loss'}`}>
                {f.altman_z_score.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fundamentals grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-0 mb-16">
        <div className="col-span-full mb-4">
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest">Valuation</h3>
        </div>
        <MetricCard label="P/L" value={f.pe_ratio?.toFixed(2)} />
        <MetricCard label="P/VP" value={f.pb_ratio?.toFixed(2)} />
        <MetricCard label="EV/EBITDA" value={f.ev_ebitda?.toFixed(2)} />
        <MetricCard label="PSR" value={f.psr?.toFixed(2)} />
        <MetricCard label="PEG" value={f.peg_ratio?.toFixed(2)} />
        <MetricCard label="P/FCF" value={f.price_to_fcf?.toFixed(2)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-0 mb-16">
        <div className="col-span-full mb-4">
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest">Rentabilidade</h3>
        </div>
        <MetricCard label="ROE" value={f.roe?.toFixed(1)} suffix="%" positive={f.roe != null ? f.roe > 0 : null} />
        <MetricCard label="ROA" value={f.roa?.toFixed(1)} suffix="%" positive={f.roa != null ? f.roa > 0 : null} />
        <MetricCard label="ROIC" value={f.roic?.toFixed(1)} suffix="%" positive={f.roic != null ? f.roic > 0 : null} />
        <MetricCard label="M. Líquida" value={f.net_margin?.toFixed(1)} suffix="%" positive={f.net_margin != null ? f.net_margin > 0 : null} />
        <MetricCard label="M. Bruta" value={f.gross_margin?.toFixed(1)} suffix="%" positive={f.gross_margin != null ? f.gross_margin > 0 : null} />
        <MetricCard label="M. Oper." value={f.operating_margin?.toFixed(1)} suffix="%" positive={f.operating_margin != null ? f.operating_margin > 0 : null} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-0 mb-16">
        <div className="col-span-full mb-4">
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest">Dividendos & Dívida</h3>
        </div>
        <MetricCard label="DY" value={f.dividend_yield?.toFixed(2)} suffix="%" positive={f.dividend_yield != null ? f.dividend_yield > 2 : null} />
        <MetricCard label="Payout" value={f.payout_ratio?.toFixed(0)} suffix="%" />
        <MetricCard label="Dív/EBITDA" value={f.net_debt_ebitda?.toFixed(2)} positive={f.net_debt_ebitda != null ? f.net_debt_ebitda < 3 : null} />
        <MetricCard label="Liq. Corr." value={f.current_ratio?.toFixed(2)} positive={f.current_ratio != null ? f.current_ratio > 1 : null} />
        <MetricCard label="Cob. Juros" value={f.interest_coverage?.toFixed(1)} positive={f.interest_coverage != null ? f.interest_coverage > 3 : null} />
        <MetricCard label="Beta" value={f.beta?.toFixed(2)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-0 mb-16">
        <div className="col-span-full mb-4">
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest">Crescimento</h3>
        </div>
        <MetricCard label="Receita 1a" value={f.revenue_growth_1y?.toFixed(1)} suffix="%" positive={f.revenue_growth_1y != null ? f.revenue_growth_1y > 0 : null} />
        <MetricCard label="Receita 3a" value={f.revenue_growth_3y?.toFixed(1)} suffix="%" positive={f.revenue_growth_3y != null ? f.revenue_growth_3y > 0 : null} />
        <MetricCard label="Receita 5a" value={f.revenue_growth_5y?.toFixed(1)} suffix="%" positive={f.revenue_growth_5y != null ? f.revenue_growth_5y > 0 : null} />
        <MetricCard label="Lucro 1a" value={f.profit_growth_1y?.toFixed(1)} suffix="%" positive={f.profit_growth_1y != null ? f.profit_growth_1y > 0 : null} />
        <MetricCard label="Lucro 3a" value={f.profit_growth_3y?.toFixed(1)} suffix="%" positive={f.profit_growth_3y != null ? f.profit_growth_3y > 0 : null} />
        <MetricCard label="Lucro 5a" value={f.profit_growth_5y?.toFixed(1)} suffix="%" positive={f.profit_growth_5y != null ? f.profit_growth_5y > 0 : null} />
      </div>

      {/* Peers */}
      {f.peers && f.peers.length > 0 && (
        <div className="mb-16">
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-4">Peers</h3>
          <div className="flex flex-wrap gap-2">
            {f.peers.map(peer => (
              <button
                key={peer}
                onClick={() => navigate(`/asset/${peer}`)}
                className="px-4 py-2 border border-border rounded-full text-[13px] text-text-secondary hover:text-white hover:border-border-hover transition-all"
              >
                {peer}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
