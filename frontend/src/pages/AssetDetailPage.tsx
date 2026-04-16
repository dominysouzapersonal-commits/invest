import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { assetsApi, watchlistApi } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import MetricCard from '../components/common/MetricCard';
import Loading from '../components/common/Loading';
import { RECOMMENDATION_COLORS } from '../types';

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
      <Card className="text-center py-12">
        <p className="text-danger mb-4">Erro ao carregar dados de {ticker}</p>
        <button onClick={() => navigate('/search')} className="text-primary-400 hover:underline">
          Voltar à busca
        </button>
      </Card>
    );
  }

  const { fundamentals: f, historical_prices: prices, score } = data;
  const isPositive = (f.change_percent ?? 0) >= 0;

  const handleAddWatchlist = async () => {
    try {
      await watchlistApi.add({ ticker: f.ticker, asset_type: f.asset_type });
      alert(`${f.ticker} adicionado à watchlist!`);
    } catch {
      alert('Erro ao adicionar ou já existe na watchlist.');
    }
  };

  return (
    <div>
      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Asset info */}
        <Card className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">{f.ticker}</h2>
                <Badge type={f.asset_type} />
              </div>
              <p className="text-dark-muted">{f.name}</p>
              {f.sector && <p className="text-xs text-dark-muted mt-1">{f.sector} {f.industry ? `· ${f.industry}` : ''}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddWatchlist} className="p-2 rounded-lg border border-dark-border hover:bg-dark-border/50 transition-colors" title="Adicionar à Watchlist">
                <Eye size={18} className="text-dark-muted" />
              </button>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-white">
              {f.currency === 'BRL' ? 'R$' : '$'} {f.price?.toFixed(2) ?? '—'}
            </span>
            <span className={`flex items-center gap-1 text-lg font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {f.change_percent?.toFixed(2)}%
            </span>
          </div>

          {f.market_cap && (
            <p className="text-sm text-dark-muted mt-2">
              Market Cap: {f.currency === 'BRL' ? 'R$' : '$'} {(f.market_cap / 1e9).toFixed(2)}B
            </p>
          )}
        </Card>

        {/* Score */}
        {score && (
          <Card className="w-full lg:w-72 flex flex-col items-center justify-center">
            <ScoreGauge score={score.total_score} size="lg" />
            <p className={`text-lg font-semibold mt-3 ${RECOMMENDATION_COLORS[score.recommendation] || 'text-white'}`}>
              {score.recommendation}
            </p>
          </Card>
        )}
      </div>

      {/* Price chart */}
      {prices.length > 0 && (
        <Card title="Histórico de Preços" className="mb-8">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={prices}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid #2a2d3a', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="url(#colorPrice)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Score breakdown */}
      {score && (
        <Card title="Detalhamento do Score" className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Valuation', score: score.valuation_score },
              { label: 'Rentabilidade', score: score.profitability_score },
              { label: 'Dividendos', score: score.dividends_score },
              { label: 'Endividamento', score: score.debt_score },
              { label: 'Crescimento', score: score.growth_score },
            ].map(item => (
              <div key={item.label} className="text-center">
                <ScoreGauge score={item.score} size="sm" showLabel={false} />
                <p className="text-xs text-dark-muted mt-2">{item.label}</p>
              </div>
            ))}
          </div>

          {Object.entries(score.details).map(([category, metrics]) => (
            <div key={category} className="mb-4">
              <h4 className="text-sm font-medium text-dark-muted capitalize mb-2">{category}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(metrics).map(([name, m]) => (
                  <div key={name} className="bg-dark-bg/50 rounded-lg p-2 border border-dark-border/50">
                    <p className="text-xs text-dark-muted">{name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-white font-medium">
                        {typeof m.value === 'number' ? m.value.toFixed(2) : m.value}
                      </span>
                      <span className={`text-xs font-medium ${m.score >= 65 ? 'text-success' : m.score >= 40 ? 'text-warning' : 'text-danger'}`}>
                        {m.score.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Analyst / Advanced Info */}
      {(f.recommendation_key || f.altman_z_score != null || f.piotroski_score != null) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {f.recommendation_key && (
            <Card>
              <p className="text-xs text-dark-muted mb-1">Recomendação Analistas</p>
              <p className="text-lg font-bold text-white capitalize">{f.recommendation_key}</p>
              {f.target_mean_price && <p className="text-sm text-dark-muted mt-1">Preço alvo: {f.currency === 'BRL' ? 'R$' : '$'} {f.target_mean_price.toFixed(2)}</p>}
              {f.number_of_analysts && <p className="text-xs text-dark-muted">{f.number_of_analysts} analistas</p>}
            </Card>
          )}
          {f.piotroski_score != null && (
            <Card>
              <p className="text-xs text-dark-muted mb-1">Piotroski F-Score</p>
              <p className={`text-2xl font-bold ${f.piotroski_score >= 7 ? 'text-success' : f.piotroski_score >= 4 ? 'text-warning' : 'text-danger'}`}>
                {f.piotroski_score}/9
              </p>
              <p className="text-xs text-dark-muted mt-1">
                {f.piotroski_score >= 7 ? 'Forte' : f.piotroski_score >= 4 ? 'Neutro' : 'Fraco'}
              </p>
            </Card>
          )}
          {f.altman_z_score != null && (
            <Card>
              <p className="text-xs text-dark-muted mb-1">Altman Z-Score</p>
              <p className={`text-2xl font-bold ${f.altman_z_score > 2.99 ? 'text-success' : f.altman_z_score > 1.81 ? 'text-warning' : 'text-danger'}`}>
                {f.altman_z_score.toFixed(2)}
              </p>
              <p className="text-xs text-dark-muted mt-1">
                {f.altman_z_score > 2.99 ? 'Zona segura' : f.altman_z_score > 1.81 ? 'Zona cinza' : 'Risco de falência'}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Fundamental data grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Valuation">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="P/L" value={f.pe_ratio?.toFixed(2)} />
            <MetricCard label="P/VP" value={f.pb_ratio?.toFixed(2)} />
            <MetricCard label="EV/EBITDA" value={f.ev_ebitda?.toFixed(2)} />
            <MetricCard label="PSR" value={f.psr?.toFixed(2)} />
            <MetricCard label="PEG Ratio" value={f.peg_ratio?.toFixed(2)} />
            <MetricCard label="P/FCF" value={f.price_to_fcf?.toFixed(2)} />
          </div>
        </Card>

        <Card title="Rentabilidade">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="ROE" value={f.roe?.toFixed(2)} suffix="%" positive={f.roe != null ? f.roe > 0 : null} />
            <MetricCard label="ROA" value={f.roa?.toFixed(2)} suffix="%" positive={f.roa != null ? f.roa > 0 : null} />
            <MetricCard label="ROIC" value={f.roic?.toFixed(2)} suffix="%" positive={f.roic != null ? f.roic > 0 : null} />
            <MetricCard label="Margem Líq." value={f.net_margin?.toFixed(2)} suffix="%" positive={f.net_margin != null ? f.net_margin > 0 : null} />
            <MetricCard label="Margem Bruta" value={f.gross_margin?.toFixed(2)} suffix="%" positive={f.gross_margin != null ? f.gross_margin > 0 : null} />
            <MetricCard label="Margem Oper." value={f.operating_margin?.toFixed(2)} suffix="%" positive={f.operating_margin != null ? f.operating_margin > 0 : null} />
          </div>
        </Card>

        <Card title="Dividendos">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Dividend Yield" value={f.dividend_yield?.toFixed(2)} suffix="%" positive={f.dividend_yield != null ? f.dividend_yield > 2 : null} />
            <MetricCard label="Payout" value={f.payout_ratio?.toFixed(1)} suffix="%" />
          </div>
        </Card>

        <Card title="Endividamento">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Dív.Líq./EBITDA" value={f.net_debt_ebitda?.toFixed(2)} positive={f.net_debt_ebitda != null ? f.net_debt_ebitda < 3 : null} />
            <MetricCard label="Dív.Líq./PL" value={f.net_debt_equity?.toFixed(2)} />
            <MetricCard label="Liq. Corrente" value={f.current_ratio?.toFixed(2)} positive={f.current_ratio != null ? f.current_ratio > 1 : null} />
            <MetricCard label="Liq. Seca" value={f.quick_ratio?.toFixed(2)} positive={f.quick_ratio != null ? f.quick_ratio > 1 : null} />
            <MetricCard label="Cobert. Juros" value={f.interest_coverage?.toFixed(2)} positive={f.interest_coverage != null ? f.interest_coverage > 3 : null} />
          </div>
        </Card>

        <Card title="Crescimento">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Receita 1a" value={f.revenue_growth_1y?.toFixed(1)} suffix="%" positive={f.revenue_growth_1y != null ? f.revenue_growth_1y > 0 : null} />
            <MetricCard label="Receita 3a" value={f.revenue_growth_3y?.toFixed(1)} suffix="%" positive={f.revenue_growth_3y != null ? f.revenue_growth_3y > 0 : null} />
            <MetricCard label="Receita 5a" value={f.revenue_growth_5y?.toFixed(1)} suffix="%" positive={f.revenue_growth_5y != null ? f.revenue_growth_5y > 0 : null} />
            <MetricCard label="Lucro 1a" value={f.profit_growth_1y?.toFixed(1)} suffix="%" positive={f.profit_growth_1y != null ? f.profit_growth_1y > 0 : null} />
            <MetricCard label="Lucro 3a" value={f.profit_growth_3y?.toFixed(1)} suffix="%" positive={f.profit_growth_3y != null ? f.profit_growth_3y > 0 : null} />
            <MetricCard label="Lucro 5a" value={f.profit_growth_5y?.toFixed(1)} suffix="%" positive={f.profit_growth_5y != null ? f.profit_growth_5y > 0 : null} />
          </div>
        </Card>

        <Card title="Mercado">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Beta" value={f.beta?.toFixed(2)} />
            <MetricCard label="Vol. Médio" value={f.avg_volume ? (f.avg_volume / 1e6).toFixed(1) + 'M' : null} />
            <MetricCard label="Máx 52s" value={f.high_52w?.toFixed(2)} />
            <MetricCard label="Mín 52s" value={f.low_52w?.toFixed(2)} />
          </div>
        </Card>
      </div>

      {/* Peers */}
      {f.peers && f.peers.length > 0 && (
        <Card title="Empresas Comparáveis (Peers)" className="mt-6">
          <div className="flex flex-wrap gap-2">
            {f.peers.map(peer => (
              <button
                key={peer}
                onClick={() => navigate(`/asset/${peer}`)}
                className="px-3 py-1.5 bg-dark-bg/50 border border-dark-border/50 rounded-lg text-sm text-primary-400 hover:bg-primary-600/20 transition-colors"
              >
                {peer}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
