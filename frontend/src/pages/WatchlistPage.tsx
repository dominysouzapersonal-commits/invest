import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { watchlistApi } from '../services/api';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import Loading from '../components/common/Loading';

export default function WatchlistPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', asset_type: 'br_stock', target_price: '', notes: '' });

  const { data: items, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: watchlistApi.list,
  });

  const addMutation = useMutation({
    mutationFn: () => watchlistApi.add({
      ticker: form.ticker.toUpperCase(),
      asset_type: form.asset_type,
      target_price: form.target_price ? parseFloat(form.target_price) : undefined,
      notes: form.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setForm({ ticker: '', asset_type: 'br_stock', target_price: '', notes: '' });
      setShowForm(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => watchlistApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-bold text-white tracking-tight">Watchlist</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-white text-black rounded-full text-[13px] font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input type="text" placeholder="Ticker" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary" />
            <select value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white text-[15px] focus:border-text-secondary">
              <option value="br_stock" className="bg-bg-card">Ação BR</option>
              <option value="fii" className="bg-bg-card">FII</option>
              <option value="us_stock" className="bg-bg-card">Ação US</option>
              <option value="us_etf" className="bg-bg-card">ETF US</option>
              <option value="bdr" className="bg-bg-card">BDR</option>
            </select>
            <input type="number" placeholder="Preço alvo" value={form.target_price} onChange={e => setForm({ ...form, target_price: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary" />
            <input type="text" placeholder="Notas" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary" />
            <button onClick={() => addMutation.mutate()} disabled={!form.ticker}
              className="py-3 bg-white text-black rounded-full text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 transition-all">
              Salvar
            </button>
          </div>
        </div>
      )}

      {items && items.length > 0 ? (
        <div className="space-y-1">
          {items.map(item => {
            const hitTarget = item.target_price && item.current_price && item.current_price <= item.target_price;
            return (
              <div key={item.id} className="flex items-center justify-between py-4 px-4 -mx-4 rounded-xl hover:bg-white/[0.03] transition-all">
                <div
                  className="flex items-center gap-5 flex-1 cursor-pointer"
                  onClick={() => navigate(`/asset/${item.ticker}`)}
                >
                  <span className="text-[15px] font-semibold text-white w-20">{item.ticker}</span>
                  <Badge type={item.asset_type} />
                  {item.notes && <span className="text-[12px] text-text-faint">{item.notes}</span>}
                  {hitTarget && (
                    <span className="flex items-center gap-1 text-[11px] text-gain">
                      <AlertTriangle size={11} /> Alvo atingido
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-8">
                  {item.current_price != null && (
                    <div className="text-right">
                      <p className="text-[11px] text-text-muted">Atual</p>
                      <p className="text-[15px] text-white tabular-nums">{item.current_price.toFixed(2)}</p>
                    </div>
                  )}
                  {item.target_price != null && (
                    <div className="text-right">
                      <p className="text-[11px] text-text-muted">Alvo</p>
                      <p className="text-[15px] text-text-secondary tabular-nums">{item.target_price.toFixed(2)}</p>
                    </div>
                  )}
                  {item.current_score != null && (
                    <ScoreGauge score={item.current_score} size="sm" showLabel={false} />
                  )}
                  <button
                    onClick={() => { if (confirm('Remover?')) removeMutation.mutate(item.id); }}
                    className="p-1.5 text-text-faint hover:text-loss transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-text-muted text-[15px]">Watchlist vazia.</p>
        </div>
      )}
    </div>
  );
}
