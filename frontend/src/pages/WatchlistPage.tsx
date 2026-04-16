import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { watchlistApi } from '../services/api';
import Card from '../components/common/Card';
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
    onError: () => alert('Erro ao adicionar. Pode já estar na watchlist.'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => watchlistApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Watchlist</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="text" placeholder="Ticker"
              value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
              className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
            />
            <select
              value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })}
              className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="br_stock">Ação BR</option>
              <option value="fii">FII</option>
              <option value="us_stock">Ação US</option>
              <option value="us_etf">ETF US</option>
              <option value="bdr">BDR</option>
            </select>
            <input
              type="number" placeholder="Preço Alvo (opcional)"
              value={form.target_price} onChange={e => setForm({ ...form, target_price: e.target.value })}
              className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
            />
            <input
              type="text" placeholder="Notas (opcional)"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={!form.ticker}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
            >
              Salvar
            </button>
          </div>
        </Card>
      )}

      {items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map(item => {
            const hitTarget = item.target_price && item.current_price && item.current_price <= item.target_price;
            return (
              <Card key={item.id} className={`${hitTarget ? 'border-success/50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => navigate(`/asset/${item.ticker}`)}
                  >
                    <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                      <Eye size={20} className="text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{item.ticker}</span>
                        <Badge type={item.asset_type} />
                        {hitTarget && (
                          <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded">
                            <AlertTriangle size={12} /> Atingiu preço alvo!
                          </span>
                        )}
                      </div>
                      {item.notes && <p className="text-xs text-dark-muted mt-0.5">{item.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {item.current_price && (
                      <div className="text-right">
                        <p className="text-sm text-dark-muted">Preço Atual</p>
                        <p className="text-white font-medium">{item.current_price.toFixed(2)}</p>
                      </div>
                    )}
                    {item.target_price && (
                      <div className="text-right">
                        <p className="text-sm text-dark-muted">Preço Alvo</p>
                        <p className="text-white font-medium">{item.target_price.toFixed(2)}</p>
                      </div>
                    )}
                    {item.current_score != null && (
                      <ScoreGauge score={item.current_score} size="sm" showLabel={false} />
                    )}
                    <button
                      onClick={() => { if (confirm('Remover da watchlist?')) removeMutation.mutate(item.id); }}
                      className="p-2 rounded hover:bg-danger/20 transition-colors"
                    >
                      <Trash2 size={16} className="text-dark-muted hover:text-danger" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Eye size={48} className="text-dark-muted mx-auto mb-4" />
          <p className="text-dark-muted">Sua watchlist está vazia.</p>
          <p className="text-sm text-dark-muted mt-1">Adicione ativos para monitorar.</p>
        </Card>
      )}
    </div>
  );
}
