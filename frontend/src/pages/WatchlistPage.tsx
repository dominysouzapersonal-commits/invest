import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { watchlistApi } from '../services/api';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import Loading from '../components/common/Loading';

export default function WatchlistPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', asset_type: 'br_stock', target_price: '', notes: '' });

  const { data: items, isLoading } = useQuery({ queryKey: ['watchlist'], queryFn: watchlistApi.list });
  const addMut = useMutation({
    mutationFn: () => watchlistApi.add({ ticker: form.ticker.toUpperCase(), asset_type: form.asset_type, target_price: form.target_price ? parseFloat(form.target_price) : undefined, notes: form.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['watchlist'] }); setForm({ ticker: '', asset_type: 'br_stock', target_price: '', notes: '' }); setShowForm(false); },
  });
  const delMut = useMutation({ mutationFn: (id: string) => watchlistApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }) });

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Watchlist</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-text-primary text-bg rounded-md text-xs font-medium hover:bg-white transition-colors flex items-center gap-1.5">
          <Plus size={12} /> Adicionar
        </button>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border rounded-lg p-4 mb-6 grid grid-cols-5 gap-3">
          <input type="text" placeholder="Ticker" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <select value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary focus:border-border-hover">
            <option value="br_stock" className="bg-bg">Ação BR</option><option value="fii" className="bg-bg">FII</option>
            <option value="us_stock" className="bg-bg">Ação US</option><option value="us_etf" className="bg-bg">ETF US</option><option value="bdr" className="bg-bg">BDR</option>
          </select>
          <input type="number" placeholder="Preço alvo" value={form.target_price} onChange={e => setForm({ ...form, target_price: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <input type="text" placeholder="Notas" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <button onClick={() => addMut.mutate()} disabled={!form.ticker}
            className="py-2 bg-text-primary text-bg rounded-md text-sm font-medium hover:bg-white disabled:opacity-30">Salvar</button>
        </div>
      )}

      {items && items.length > 0 ? (
        <div>
          {items.map(item => {
            const hit = item.target_price && item.current_price && item.current_price <= item.target_price;
            return (
              <div key={item.id} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-bg-hover transition-colors">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => navigate(`/asset/${item.ticker}`)}>
                  <span className="text-sm font-medium text-text-primary w-16">{item.ticker}</span>
                  <Badge type={item.asset_type} />
                  {item.notes && <span className="text-[11px] text-text-faint">{item.notes}</span>}
                  {hit && <span className="flex items-center gap-1 text-[10px] text-gain"><AlertTriangle size={10} /> Alvo</span>}
                </div>
                <div className="flex items-center gap-6">
                  {item.current_price != null && <div className="text-right"><p className="text-[10px] text-text-muted">Atual</p><p className="text-sm text-text-primary tabular-nums">{item.current_price.toFixed(2)}</p></div>}
                  {item.target_price != null && <div className="text-right"><p className="text-[10px] text-text-muted">Alvo</p><p className="text-sm text-text-secondary tabular-nums">{item.target_price.toFixed(2)}</p></div>}
                  {item.current_score != null && <ScoreGauge score={item.current_score} size="sm" showLabel={false} />}
                  <button onClick={() => { if (confirm('Remover?')) delMut.mutate(item.id); }} className="p-1 text-text-faint hover:text-loss"><X size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : <p className="text-center text-xs text-text-muted py-16">Watchlist vazia.</p>}
    </div>
  );
}
