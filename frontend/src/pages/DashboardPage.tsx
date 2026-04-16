import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight } from 'lucide-react';
import { portfolioApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: portfolioApi.getSummary,
  });

  if (isLoading) return <Loading text="Carregando portfolio..." />;

  const hasPortfolio = summary && summary.positions.length > 0;

  if (!hasPortfolio) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Portfolio vazio</h2>
        <p className="text-text-muted text-[15px] mb-8 max-w-md">
          Importe seu extrato da XP ou adicione posições manualmente para ver seu dashboard.
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/portfolio')} className="px-6 py-3 bg-white text-black rounded-full text-[14px] font-semibold hover:bg-white/90 transition-all">
            Portfolio
          </button>
          <button onClick={() => navigate('/search')} className="px-6 py-3 border border-border text-text-secondary rounded-full text-[14px] font-medium hover:text-white hover:border-border-hover transition-all">
            Buscar Ativos
          </button>
        </div>
      </div>
    );
  }

  const plPositive = summary.total_profit_loss >= 0;
  const allocTypeData = Object.entries(summary.allocation_by_type).map(([name, value]) => ({ name, value }));

  const topPositions = [...summary.positions]
    .filter(p => p.current_value)
    .sort((a, b) => (b.current_value ?? 0) - (a.current_value ?? 0))
    .slice(0, 6);

  return (
    <div>
      {/* Hero numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-widest mb-2">Investido</p>
          <p className="text-3xl font-bold text-white tabular-nums">
            R$ {summary.total_invested.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-widest mb-2">Valor Atual</p>
          <p className="text-3xl font-bold text-white tabular-nums">
            R$ {summary.total_current.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-widest mb-2">Lucro / Prejuízo</p>
          <p className={`text-3xl font-bold tabular-nums ${plPositive ? 'text-gain' : 'text-loss'}`}>
            {plPositive ? '+' : ''}R$ {Math.abs(summary.total_profit_loss).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-widest mb-2">Rentabilidade</p>
          <p className={`text-3xl font-bold tabular-nums ${plPositive ? 'text-gain' : 'text-loss'}`}>
            {summary.total_profit_loss_pct >= 0 ? '+' : ''}{summary.total_profit_loss_pct.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Allocation */}
        <div>
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-6">Alocação por Tipo</h3>
          <div className="space-y-3">
            {allocTypeData.map(item => (
              <div key={item.name} className="flex items-center gap-4">
                <span className="text-[13px] text-text-secondary w-20 shrink-0">{item.name}</span>
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-text-muted rounded-full" style={{ width: `${item.value}%` }} />
                </div>
                <span className="text-[13px] text-white tabular-nums w-12 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector allocation */}
        <div>
          <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-6">Alocação por Setor</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Object.entries(summary.allocation_by_sector).map(([n, v]) => ({ name: n, value: v }))} layout="vertical">
              <XAxis type="number" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#a1a1aa', fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111113', border: '1px solid #1c1c1e', borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="value" fill="#3f3f46" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top positions */}
      <div>
        <h3 className="text-[11px] text-text-muted uppercase tracking-widest mb-6">Posições</h3>
        <div className="space-y-1">
          {topPositions.map(pos => (
            <div
              key={pos.id}
              className="flex items-center justify-between py-4 px-4 -mx-4 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-all"
              onClick={() => navigate(`/asset/${pos.ticker}`)}
            >
              <div className="flex items-center gap-4">
                <span className="text-[15px] font-semibold text-white w-20">{pos.ticker}</span>
                <Badge type={pos.asset_type} />
                <span className="text-[13px] text-text-muted">{pos.quantity} cotas</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[15px] text-white tabular-nums">R$ {pos.current_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-[12px] tabular-nums ${(pos.profit_loss_pct ?? 0) >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {(pos.profit_loss_pct ?? 0) >= 0 ? '+' : ''}{pos.profit_loss_pct?.toFixed(2)}%
                  </p>
                </div>
                <ArrowRight size={14} className="text-text-faint" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
