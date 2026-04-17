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
  if (error || !data) return (
    <div className="text-center py-20">
      <p className="text-xs text-loss mb-3">Erro ao carregar {ticker}</p>
      <button onClick={() => navigate('/search')} className="text-xs text-text-muted hover:text-text-primary">Voltar</button>
    </div>
  );

  const { fundamentals: f, historical_prices: prices, score } = data;
  const up = (f.change_percent ?? 0) >= 0;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft size={12} /> Voltar
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{f.ticker}</h1>
            <Badge type={f.asset_type} />
          </div>
          <p className="text-xs text-text-secondary">{f.name}</p>
          {f.sector && <p className="text-[11px] text-text-muted mt-0.5">{f.sector}{f.industry ? ` · ${f.industry}` : ''}</p>}
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-2xl font-semibold text-text-primary tabular-nums">
              {f.currency === 'BRL' ? 'R$' : '$'}{f.price?.toFixed(2) ?? '—'}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-gain' : 'text-loss'}`}>
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {f.change_percent?.toFixed(2)}%
            </span>
          </div>
          {f.market_cap && <p className="text-[11px] text-text-muted mt-1">Cap: {f.currency === 'BRL' ? 'R$' : '$'}{(f.market_cap / 1e9).toFixed(1)}B</p>}
        </div>
        <div className="flex items-center gap-6">
          {score && (
            <div className="text-center">
              <ScoreGauge score={score.total_score} size="lg" />
              <p className={`text-xs mt-1 ${score.total_score >= 60 ? 'text-text-secondary' : score.total_score >= 40 ? 'text-text-muted' : 'text-loss'}`}>{score.recommendation}</p>
            </div>
          )}
          <button onClick={async () => { try { await watchlistApi.add({ ticker: f.ticker, asset_type: f.asset_type }); } catch {} }}
            className="px-3 py-1.5 border border-border text-xs text-text-secondary rounded-md hover:text-text-primary hover:border-border-hover transition-colors">
            + Watchlist
          </button>
        </div>
      </div>

      {/* Chart */}
      {prices.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-text-muted mb-3">Preço 1 ano</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={prices}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ededed" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#ededed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: 8, fontSize: 12, color: '#ededed' }} labelStyle={{ color: '#888' }} itemStyle={{ color: '#ededed' }} />
              <Area type="monotone" dataKey="close" stroke="#ededed" fill="url(#g)" strokeWidth={1.2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Score breakdown */}
      {score && (
        <div className="mb-8">
          <p className="text-xs text-text-muted mb-4">Score detalhado</p>
          <div className="flex gap-8 mb-6">
            {[
              { l: 'Valuation', s: score.valuation_score },
              { l: 'Rentab.', s: score.profitability_score },
              { l: 'FCF/Lucro', s: score.fcf_quality_score },
              { l: 'Dividendos', s: score.dividends_score },
              { l: 'Dívida', s: score.debt_score },
              { l: 'Cresc.', s: score.growth_score },
            ].map(i => (
              <div key={i.l} className="text-center">
                <ScoreGauge score={i.s} size="sm" showLabel={false} />
                <p className="text-[10px] text-text-muted mt-1.5">{i.l}</p>
              </div>
            ))}
          </div>
          {Object.entries(score.details)
            .filter(([cat]) => !['weights_used', 'pillar_scores', 'advanced'].includes(cat))
            .map(([cat, metrics]) => (
            <div key={cat} className="mb-4">
              <p className="text-[11px] text-text-muted mb-2 capitalize">{cat.replace(/_/g, ' ')}</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-x-6">
                {Object.entries(metrics as Record<string, any>)
                  .filter(([, m]) => m && typeof m === 'object' && 'score' in m)
                  .map(([n, m]) => (
                  <div key={n} className="flex items-center justify-between py-1.5 border-b border-border/40">
                    <span className="text-[11px] text-text-muted">{n}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-primary tabular-nums">{typeof m.value === 'number' ? m.value.toFixed(2) : m.value}</span>
                      <span className={`text-[9px] tabular-nums ${m.score >= 65 ? 'text-gain' : m.score >= 40 ? 'text-text-muted' : 'text-loss'}`}>{Math.round(m.score)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advanced */}
      {(f.recommendation_key || f.piotroski_score != null || f.altman_z_score != null || f.dcf_value != null || f.rsi_14 != null) && (
        <div className="flex flex-wrap gap-10 mb-8">
          {f.recommendation_key && (
            <div>
              <p className="text-[11px] text-text-muted mb-1">Analistas</p>
              <p className="text-base font-semibold text-text-primary capitalize">{f.recommendation_key}</p>
              {f.target_mean_price && <p className="text-[11px] text-text-muted">Alvo: {f.currency === 'BRL' ? 'R$' : '$'}{f.target_mean_price.toFixed(2)}</p>}
              {f.number_of_analysts && <p className="text-[10px] text-text-faint">{f.number_of_analysts} analistas</p>}
            </div>
          )}
          {f.piotroski_score != null && (
            <div>
              <p className="text-[11px] text-text-muted mb-1">Piotroski</p>
              <p className={`text-base font-semibold ${f.piotroski_score >= 7 ? 'text-gain' : f.piotroski_score >= 4 ? 'text-text-primary' : 'text-loss'}`}>{f.piotroski_score}/9</p>
            </div>
          )}
          {f.altman_z_score != null && (
            <div>
              <p className="text-[11px] text-text-muted mb-1">Altman Z</p>
              <p className={`text-base font-semibold ${f.altman_z_score > 2.99 ? 'text-gain' : f.altman_z_score > 1.81 ? 'text-text-primary' : 'text-loss'}`}>{f.altman_z_score.toFixed(2)}</p>
            </div>
          )}
          {f.dcf_value != null && (
            <div>
              <p className="text-[11px] text-text-muted mb-1">DCF (Valor Justo)</p>
              <p className="text-base font-semibold text-text-primary">{f.currency === 'BRL' ? 'R$' : '$'}{f.dcf_value.toFixed(2)}</p>
              {f.dcf_upside_pct != null && (
                <p className={`text-[11px] ${f.dcf_upside_pct > 0 ? 'text-gain' : 'text-loss'}`}>
                  {f.dcf_upside_pct > 0 ? '+' : ''}{f.dcf_upside_pct.toFixed(1)}% upside
                </p>
              )}
            </div>
          )}
          {f.rsi_14 != null && (
            <div>
              <p className="text-[11px] text-text-muted mb-1">RSI (14)</p>
              <p className={`text-base font-semibold ${f.rsi_14 > 70 ? 'text-loss' : f.rsi_14 < 30 ? 'text-gain' : 'text-text-primary'}`}>{f.rsi_14.toFixed(0)}</p>
              <p className="text-[10px] text-text-faint">{f.rsi_14 > 70 ? 'Sobrecomprado' : f.rsi_14 < 30 ? 'Sobrevendido' : 'Neutro'}</p>
            </div>
          )}
          {f.sma_50 != null && (
            <div>
              <p className="text-[11px] text-text-muted mb-1">SMA 50/200</p>
              <p className="text-base font-semibold text-text-primary">{f.sma_50.toFixed(2)}</p>
              {f.sma_200 != null && <p className="text-[10px] text-text-faint">200d: {f.sma_200.toFixed(2)}</p>}
            </div>
          )}
        </div>
      )}

      {/* Metrics grid */}
      {[
        { title: 'Valuation', cols: 7, items: [
          { l: 'P/L', v: f.pe_ratio?.toFixed(2) },
          { l: 'P/VP', v: f.pb_ratio?.toFixed(2) },
          { l: 'EV/EBITDA', v: f.ev_ebitda?.toFixed(2) },
          { l: 'PSR', v: f.psr?.toFixed(2) },
          { l: 'P/FCF', v: f.price_to_fcf?.toFixed(2) },
          { l: 'PEG', v: f.peg_ratio?.toFixed(2) },
          { l: 'EV/Revenue', v: f.ev_revenue?.toFixed(2) },
        ]},
        { title: 'Rentabilidade', cols: 7, items: [
          { l: 'ROE', v: f.roe?.toFixed(1), s: '%', p: f.roe != null ? f.roe > 0 : null },
          { l: 'ROA', v: f.roa?.toFixed(1), s: '%', p: f.roa != null ? f.roa > 0 : null },
          { l: 'ROIC', v: f.roic?.toFixed(1), s: '%', p: f.roic != null ? f.roic > 0 : null },
          { l: 'M. Líq.', v: f.net_margin?.toFixed(1), s: '%', p: f.net_margin != null ? f.net_margin > 0 : null },
          { l: 'M. Bruta', v: f.gross_margin?.toFixed(1), s: '%', p: f.gross_margin != null ? f.gross_margin > 0 : null },
          { l: 'M. EBITDA', v: f.ebitda_margin?.toFixed(1), s: '%', p: f.ebitda_margin != null ? f.ebitda_margin > 0 : null },
          { l: 'M. Oper.', v: f.operating_margin?.toFixed(1), s: '%', p: f.operating_margin != null ? f.operating_margin > 0 : null },
        ]},
        { title: 'Dividendos', cols: 2, items: [
          { l: 'DY', v: f.dividend_yield?.toFixed(2), s: '%', p: f.dividend_yield != null ? f.dividend_yield > 2 : null },
          { l: 'Payout', v: f.payout_ratio?.toFixed(0), s: '%' },
        ]},
        { title: 'Endividamento', cols: 5, items: [
          { l: 'Dív.Líq/EBITDA', v: f.net_debt_ebitda?.toFixed(2), p: f.net_debt_ebitda != null ? f.net_debt_ebitda < 3 : null },
          { l: 'Dív.Líq/PL', v: f.net_debt_equity?.toFixed(2), p: f.net_debt_equity != null ? f.net_debt_equity < 1 : null },
          { l: 'D/E', v: f.debt_to_equity?.toFixed(2), p: f.debt_to_equity != null ? f.debt_to_equity < 1.5 : null },
          { l: 'Liq. Corr.', v: f.current_ratio?.toFixed(2), p: f.current_ratio != null ? f.current_ratio > 1 : null },
          { l: 'Cob. Juros', v: f.interest_coverage?.toFixed(1), p: f.interest_coverage != null ? f.interest_coverage > 3 : null },
        ]},
        { title: 'Crescimento', cols: 4, items: [
          { l: 'CAGR Rec 5a', v: f.revenue_growth_5y?.toFixed(1), s: '%', p: f.revenue_growth_5y != null ? f.revenue_growth_5y > 0 : null },
          { l: 'CAGR Lucro 5a', v: f.profit_growth_5y?.toFixed(1), s: '%', p: f.profit_growth_5y != null ? f.profit_growth_5y > 0 : null },
          { l: 'Rec. 1a', v: f.revenue_growth_1y?.toFixed(1), s: '%', p: f.revenue_growth_1y != null ? f.revenue_growth_1y > 0 : null },
          { l: 'Lucro 1a', v: f.profit_growth_1y?.toFixed(1), s: '%', p: f.profit_growth_1y != null ? f.profit_growth_1y > 0 : null },
        ]},
        { title: 'Per-share & Yields', cols: 6, items: [
          { l: 'LPA', v: f.eps?.toFixed(2) },
          { l: 'VPA', v: f.book_value_per_share?.toFixed(2) },
          { l: 'Earn. Yield', v: f.earnings_yield != null ? (f.earnings_yield * 100).toFixed(1) : undefined, s: '%', p: f.earnings_yield != null ? f.earnings_yield > 0.05 : null },
          { l: 'FCF Yield', v: f.fcf_yield != null ? (f.fcf_yield * 100).toFixed(1) : undefined, s: '%', p: f.fcf_yield != null ? f.fcf_yield > 0.05 : null },
          { l: 'Fwd P/E', v: f.forward_pe?.toFixed(1) },
          { l: 'Beta', v: f.beta?.toFixed(2) },
        ]},
      ].map(section => (
        <div key={section.title} className="mb-6">
          <p className="text-xs text-text-muted mb-2">{section.title}</p>
          <div className={`grid grid-cols-3 gap-x-6 ${section.cols >= 7 ? 'md:grid-cols-7' : section.cols >= 6 ? 'md:grid-cols-6' : section.cols >= 5 ? 'md:grid-cols-5' : section.cols >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {section.items.map(i => <MetricCard key={i.l} label={i.l} value={i.v} suffix={'s' in i ? (i as any).s : ''} positive={i.p ?? null} />)}
          </div>
        </div>
      ))}

      {/* Peers */}
      {f.peers && f.peers.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-text-muted mb-2">Peers</p>
          <div className="flex flex-wrap gap-1.5">
            {f.peers.map(p => (
              <button key={p} onClick={() => navigate(`/asset/${p}`)}
                className="px-3 py-1 border border-border rounded-md text-xs text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
