import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { portfolioApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: portfolioApi.getSummary,
  });

  if (isLoading) return <Loading />;

  const empty = !summary || summary.positions.length === 0;
  if (empty) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-text-secondary mb-1">Portfolio vazio</p>
        <p className="text-xs text-text-muted mb-6">Importe seu extrato da XP ou adicione posições.</p>
        <div className="flex justify-center gap-2">
          <button onClick={() => navigate('/portfolio')} className="px-4 py-1.5 bg-text-primary text-bg rounded-md text-xs font-medium hover:bg-white transition-colors">Portfolio</button>
          <button onClick={() => navigate('/search')} className="px-4 py-1.5 border border-border text-text-secondary rounded-md text-xs hover:text-text-primary hover:border-border-hover transition-colors">Buscar</button>
        </div>
      </div>
    );
  }

  const pos = summary.total_profit_loss >= 0;
  const alloc = Object.entries(summary.allocation_by_type).map(([name, value]) => ({ name, value }));
  const sectors = Object.entries(summary.allocation_by_sector).map(([name, value]) => ({ name, value }));
  const top = [...summary.positions].filter(p => p.current_value).sort((a, b) => (b.current_value ?? 0) - (a.current_value ?? 0)).slice(0, 8);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { l: 'Investido', v: `R$ ${summary.total_invested.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` },
          { l: 'Atual', v: `R$ ${summary.total_current.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` },
          { l: 'P&L', v: `${pos ? '+' : ''}R$ ${Math.abs(summary.total_profit_loss).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, c: pos },
          { l: 'Rent.', v: `${summary.total_profit_loss_pct >= 0 ? '+' : ''}${summary.total_profit_loss_pct.toFixed(2)}%`, c: pos },
        ].map(item => (
          <div key={item.l}>
            <p className="text-xs text-text-muted mb-1">{item.l}</p>
            <p className={`text-xl font-semibold tabular-nums ${item.c === true ? 'text-gain' : item.c === false ? 'text-loss' : 'text-text-primary'}`}>{item.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div>
          <p className="text-xs text-text-muted mb-4">Alocação por tipo</p>
          <div className="space-y-2.5">
            {alloc.map(a => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-16 shrink-0">{a.name}</span>
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-text-faint rounded-full transition-all" style={{ width: `${a.value}%` }} />
                </div>
                <span className="text-xs text-text-primary tabular-nums w-10 text-right">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-4">Por setor</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sectors} layout="vertical">
              <XAxis type="number" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#888', fontSize: 11 }} width={70} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#333" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted mb-3">Posições</p>
        {top.map(p => (
          <div key={p.id} onClick={() => navigate(`/asset/${p.ticker}`)}
            className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-bg-hover transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-primary w-16">{p.ticker}</span>
              <Badge type={p.asset_type} />
              <span className="text-xs text-text-muted">{p.quantity}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-text-primary tabular-nums">R$ {p.current_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className={`text-[11px] tabular-nums ${(p.profit_loss_pct ?? 0) >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {(p.profit_loss_pct ?? 0) >= 0 ? '+' : ''}{p.profit_loss_pct?.toFixed(2)}%
                </p>
              </div>
              <ChevronRight size={12} className="text-text-faint" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
