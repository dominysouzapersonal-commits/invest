import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Target, BarChart3, DollarSign, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { reportApi } from '../services/api';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import Loading from '../components/common/Loading';
import type { FullReport, CategoryRecommendation } from '../types';
import { useState } from 'react';

function scoreColor(s: number) {
  if (s >= 80) return 'text-emerald-400';
  if (s >= 60) return 'text-text-primary';
  if (s >= 40) return 'text-text-muted';
  return 'text-red-400';
}

function recColor(r: string) {
  if (r.includes('Excelente')) return 'text-emerald-400';
  if (r.includes('Bom')) return 'text-green-400';
  if (r.includes('Neutro')) return 'text-yellow-400';
  if (r.includes('Cautela')) return 'text-orange-400';
  return 'text-red-400';
}

function fmtNum(v: number | null | undefined, decimals = 2) {
  if (v == null) return '—';
  return v.toFixed(decimals);
}



function CategorySection({ cat, navigate }: { cat: CategoryRecommendation; navigate: (path: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const displayAssets = expanded ? cat.assets : cat.assets.slice(0, 5);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">{cat.category_label}</h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            {cat.target_pct}% — R$ {cat.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        {cat.top_pick && (
          <div className="text-right">
            <p className="text-[11px] text-text-muted">Top pick</p>
            <button
              onClick={() => navigate(`/asset/${cat.top_pick}`)}
              className="text-sm font-semibold text-text-primary hover:text-emerald-400 transition-colors"
            >
              {cat.top_pick}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-text-secondary mb-4">{cat.rationale}</p>

      {cat.assets.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 text-text-muted font-medium w-20">Ticker</th>
                  <th className="text-left py-2 text-text-muted font-medium">Nome</th>
                  <th className="text-right py-2 text-text-muted font-medium">Score</th>
                  <th className="text-right py-2 text-text-muted font-medium">Preço</th>
                  <th className="text-right py-2 text-text-muted font-medium">P/L</th>
                  <th className="text-right py-2 text-text-muted font-medium">ROE</th>
                  <th className="text-right py-2 text-text-muted font-medium">DY</th>
                  <th className="text-right py-2 text-text-muted font-medium">Dív/EBITDA</th>
                  <th className="text-left py-2 text-text-muted font-medium pl-4 hidden lg:table-cell">Por que sim</th>
                  <th className="text-left py-2 text-text-muted font-medium pl-4 hidden lg:table-cell">Riscos</th>
                </tr>
              </thead>
              <tbody>
                {displayAssets.map((a) => (
                  <tr
                    key={a.ticker}
                    onClick={() => navigate(`/asset/${a.ticker}`)}
                    className="border-b border-border/20 cursor-pointer hover:bg-bg-hover transition-colors"
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{a.ticker}</span>
                        <Badge type={a.asset_type} />
                      </div>
                    </td>
                    <td className="py-2.5 text-text-secondary max-w-[140px] truncate">{a.name}</td>
                    <td className={`py-2.5 text-right font-semibold tabular-nums ${scoreColor(a.score)}`}>{a.score.toFixed(0)}</td>
                    <td className="py-2.5 text-right text-text-primary tabular-nums">
                      {a.currency === 'BRL' ? 'R$' : '$'}{fmtNum(a.price)}
                    </td>
                    <td className="py-2.5 text-right text-text-secondary tabular-nums">{fmtNum(a.pe_ratio, 1)}</td>
                    <td className={`py-2.5 text-right tabular-nums ${a.roe && a.roe > 15 ? 'text-emerald-400' : 'text-text-secondary'}`}>
                      {a.roe != null ? `${fmtNum(a.roe, 1)}%` : '—'}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums ${a.dividend_yield && a.dividend_yield > 5 ? 'text-emerald-400' : 'text-text-secondary'}`}>
                      {a.dividend_yield != null ? `${fmtNum(a.dividend_yield, 1)}%` : '—'}
                    </td>
                    <td className={`py-2.5 text-right tabular-nums ${a.net_debt_ebitda != null && a.net_debt_ebitda > 3 ? 'text-red-400' : 'text-text-secondary'}`}>
                      {fmtNum(a.net_debt_ebitda, 1)}
                    </td>
                    <td className="py-2.5 pl-4 text-[11px] text-text-muted max-w-[200px] truncate hidden lg:table-cell">
                      {a.why_yes || '—'}
                    </td>
                    <td className="py-2.5 pl-4 text-[11px] text-text-muted max-w-[200px] truncate hidden lg:table-cell">
                      {a.why_no || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cat.assets.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Mostrar menos' : `Ver todos (${cat.assets.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { data: report, isLoading, error } = useQuery<FullReport>({
    queryKey: ['full-report'],
    queryFn: reportApi.getFullAnalysis,
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading) return <Loading text="Analisando 40+ ativos com brapi + FMP..." />;
  if (error || !report) return (
    <div className="text-center py-20">
      <p className="text-xs text-red-400 mb-2">Erro ao gerar relatório</p>
      <p className="text-[11px] text-text-muted">Verifique as API keys no backend.</p>
    </div>
  );

  const topAssets = report.all_assets.slice(0, 10);
  const bottomAssets = [...report.all_assets].sort((a, b) => a.score - b.score).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-1">
          Relatório Completo de Análise
        </h1>
        <p className="text-xs text-text-muted">
          {report.total_assets_analyzed} ativos analisados — {new Date(report.generated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Macro */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { l: 'SELIC', v: report.macro.selic_current != null ? `${report.macro.selic_current}%` : '—', icon: <BarChart3 size={14} /> },
          { l: 'IPCA', v: report.macro.ipca_current != null ? `${report.macro.ipca_current}%` : '—', icon: <TrendingUp size={14} /> },
          { l: 'USD/BRL', v: report.macro.usd_brl != null ? `R$ ${Number(report.macro.usd_brl).toFixed(2)}` : '—', icon: <DollarSign size={14} /> },
          { l: 'EUR/BRL', v: report.macro.eur_brl != null ? `R$ ${Number(report.macro.eur_brl).toFixed(2)}` : '—', icon: <DollarSign size={14} /> },
        ].map(m => (
          <div key={m.l}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-text-faint">{m.icon}</span>
              <p className="text-xs text-text-muted">{m.l}</p>
            </div>
            <p className="text-lg font-semibold text-text-primary tabular-nums">{m.v}</p>
          </div>
        ))}
      </div>

      {/* Investor Profile */}
      <div className="border border-border/50 rounded-lg p-5 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-text-faint" />
          <h2 className="text-sm font-medium text-text-primary">Perfil do Investidor</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-text-muted">Capital</p>
            <p className="text-text-primary font-medium">R$ {TOTAL.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-text-muted">Corretora</p>
            <p className="text-text-primary font-medium">{report.investor_profile.broker}</p>
          </div>
          <div>
            <p className="text-text-muted">Horizonte</p>
            <p className="text-text-primary font-medium">{report.investor_profile.horizon}</p>
          </div>
          <div>
            <p className="text-text-muted">Risco</p>
            <p className="text-text-primary font-medium">{report.investor_profile.risk}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] text-text-muted mb-2">Alocação-alvo</p>
          <div className="flex gap-2 flex-wrap">
            {report.categories.map(c => (
              <span key={c.category} className="px-2.5 py-1 border border-border/50 rounded-md text-[11px] text-text-secondary">
                {c.category_label}: {c.target_pct}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Picks */}
      {report.portfolio_summary.picks && report.portfolio_summary.picks.length > 0 && (
        <div className="border border-emerald-500/20 rounded-lg p-5 mb-10 bg-emerald-500/[0.03]">
          <div className="flex items-center gap-2 mb-4">
            <Target size={14} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-text-primary">Carteira Sugerida — R$ {TOTAL.toLocaleString('pt-BR')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 text-text-muted font-medium">Ativo</th>
                  <th className="text-left py-2 text-text-muted font-medium">Categoria</th>
                  <th className="text-right py-2 text-text-muted font-medium">Qtd</th>
                  <th className="text-right py-2 text-text-muted font-medium">Preço</th>
                  <th className="text-right py-2 text-text-muted font-medium">Total</th>
                  <th className="text-right py-2 text-text-muted font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {report.portfolio_summary.picks.map((p: any) => (
                  <tr key={p.ticker} className="border-b border-border/20">
                    <td className="py-2.5 font-medium text-text-primary">{p.ticker}</td>
                    <td className="py-2.5 text-text-secondary">{p.category}</td>
                    <td className="py-2.5 text-right text-text-primary tabular-nums">{p.qty}</td>
                    <td className="py-2.5 text-right text-text-secondary tabular-nums">R$ {Number(p.price).toFixed(2)}</td>
                    <td className="py-2.5 text-right text-text-primary font-medium tabular-nums">R$ {Number(p.total).toFixed(2)}</td>
                    <td className={`py-2.5 text-right font-semibold tabular-nums ${p.score != null ? scoreColor(p.score) : 'text-text-muted'}`}>
                      {p.score != null ? p.score.toFixed(0) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={4} className="py-2.5 text-text-muted font-medium">Total alocado</td>
                  <td className="py-2.5 text-right text-text-primary font-semibold tabular-nums">
                    R$ {Number(report.portfolio_summary.total_allocated).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                {report.portfolio_summary.remaining > 0 && (
                  <tr>
                    <td colSpan={4} className="py-1 text-text-muted text-[11px]">Troco disponível</td>
                    <td className="py-1 text-right text-text-muted text-[11px] tabular-nums">
                      R$ {Number(report.portfolio_summary.remaining).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Top 10 */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={14} className="text-emerald-400" />
          <h2 className="text-sm font-medium text-text-primary">Top 10 por Score</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {topAssets.map((a, i) => (
            <button
              key={a.ticker}
              onClick={() => navigate(`/asset/${a.ticker}`)}
              className="border border-border/50 rounded-lg p-3 text-left hover:border-border-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary">{a.ticker}</span>
                <span className="text-[10px] text-text-faint">#{i + 1}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <ScoreGauge score={a.score} size="sm" showLabel={false} />
                <span className={`text-xs ${recColor(a.recommendation)}`}>{a.recommendation}</span>
              </div>
              <p className="text-[11px] text-text-muted truncate">{a.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom 5 */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} className="text-red-400" />
          <h2 className="text-sm font-medium text-text-primary">Alertas — Piores Scores</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {bottomAssets.map((a) => (
            <button
              key={a.ticker}
              onClick={() => navigate(`/asset/${a.ticker}`)}
              className="border border-red-500/20 rounded-lg p-3 text-left hover:border-red-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary">{a.ticker}</span>
                <ScoreGauge score={a.score} size="sm" showLabel={false} />
              </div>
              <span className={`text-[11px] ${recColor(a.recommendation)}`}>{a.recommendation}</span>
              <p className="text-[11px] text-text-muted truncate mt-0.5">{a.why_no}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Categories detail */}
      <div className="mb-10">
        <h2 className="text-base font-semibold text-text-primary mb-6">Análise por Categoria</h2>
        {report.categories.map(cat => (
          <CategorySection key={cat.category} cat={cat} navigate={navigate} />
        ))}
      </div>

      {/* Methodology */}
      <div className="border-t border-border/50 pt-8 mb-10">
        <h2 className="text-sm font-medium text-text-primary mb-4">Metodologia</h2>
        <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
          {report.methodology}
        </div>
      </div>
    </div>
  );
}

const TOTAL = 6700;
