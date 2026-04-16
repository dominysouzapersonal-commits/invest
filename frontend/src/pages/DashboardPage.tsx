import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import { Briefcase, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { portfolioApi } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

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
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
        <Card className="text-center py-16">
          <Briefcase size={48} className="text-dark-muted mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Portfolio Vazio</h3>
          <p className="text-dark-muted mb-6">
            Comece importando seu extrato da XP ou adicionando posições manualmente.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/portfolio')} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
              Ir para Portfolio
            </button>
            <button onClick={() => navigate('/search')} className="px-5 py-2.5 border border-dark-border text-dark-text rounded-lg hover:bg-dark-border/50 transition-colors font-medium">
              Buscar Ativos
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const allocTypeData = Object.entries(summary.allocation_by_type).map(([name, value]) => ({ name, value }));
  const allocSectorData = Object.entries(summary.allocation_by_sector).map(([name, value]) => ({ name, value }));
  const plPositive = summary.total_profit_loss >= 0;

  const topPositions = [...summary.positions]
    .filter(p => p.current_value)
    .sort((a, b) => (b.current_value ?? 0) - (a.current_value ?? 0))
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-dark-muted">Total Investido</p>
          <p className="text-2xl font-bold text-white mt-1">R$ {summary.total_invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card>
          <p className="text-sm text-dark-muted">Valor Atual</p>
          <p className="text-2xl font-bold text-white mt-1">R$ {summary.total_current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card>
          <p className="text-sm text-dark-muted">Lucro/Prejuízo</p>
          <p className={`text-2xl font-bold mt-1 flex items-center gap-2 ${plPositive ? 'text-success' : 'text-danger'}`}>
            {plPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            R$ {Math.abs(summary.total_profit_loss).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-dark-muted">Rentabilidade</p>
          <p className={`text-2xl font-bold mt-1 ${plPositive ? 'text-success' : 'text-danger'}`}>
            {summary.total_profit_loss_pct >= 0 ? '+' : ''}{summary.total_profit_loss_pct.toFixed(2)}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Allocation by type */}
        <Card title="Alocação por Tipo">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={allocTypeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {allocTypeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid #2a2d3a', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Allocation by sector */}
        <Card title="Alocação por Setor">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={allocSectorData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid #2a2d3a', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top positions */}
      <Card title="Maiores Posições">
        <div className="space-y-3">
          {topPositions.map(pos => (
            <div
              key={pos.id}
              className="flex items-center justify-between p-3 rounded-lg bg-dark-bg/50 border border-dark-border/50 cursor-pointer hover:border-primary-500/30 transition-colors"
              onClick={() => navigate(`/asset/${pos.ticker}`)}
            >
              <div className="flex items-center gap-3">
                <Badge type={pos.asset_type} />
                <span className="text-white font-medium">{pos.ticker}</span>
                <span className="text-dark-muted text-sm">{pos.quantity} cotas</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white text-sm">R$ {pos.current_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-xs ${(pos.profit_loss_pct ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {(pos.profit_loss_pct ?? 0) >= 0 ? '+' : ''}{pos.profit_loss_pct?.toFixed(2)}%
                  </p>
                </div>
                <ArrowRight size={16} className="text-dark-muted" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
