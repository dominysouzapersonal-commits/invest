import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Plus, X } from 'lucide-react';
import { portfolioApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function PortfolioPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', asset_type: 'br_stock', quantity: '', avg_price: '' });

  const { data: positions, isLoading } = useQuery({ queryKey: ['positions'], queryFn: portfolioApi.getPositions });
  const importMut = useMutation({
    mutationFn: (f: File) => portfolioApi.importFile(f),
    onSuccess: (d) => { alert(d.message); qc.invalidateQueries({ queryKey: ['positions'] }); },
  });
  const createMut = useMutation({
    mutationFn: () => portfolioApi.createPosition({ ticker: form.ticker.toUpperCase(), asset_type: form.asset_type, quantity: parseFloat(form.quantity), avg_price: parseFloat(form.avg_price) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['positions'] }); setForm({ ticker: '', asset_type: 'br_stock', quantity: '', avg_price: '' }); setShowForm(false); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => portfolioApi.deletePosition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['positions'] }),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Portfolio</h2>
        <div className="flex gap-2">
          <label className="px-3 py-1.5 border border-border text-xs text-text-secondary rounded-md cursor-pointer hover:text-text-primary hover:border-border-hover transition-colors flex items-center gap-1.5">
            <Upload size={12} /> Importar XP
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importMut.mutate(f); }} />
          </label>
          <button onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-text-primary text-bg rounded-md text-xs font-medium hover:bg-white transition-colors flex items-center gap-1.5">
            <Plus size={12} /> Adicionar
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border rounded-lg p-4 mb-6 grid grid-cols-5 gap-3">
          <input type="text" placeholder="Ticker" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <select value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary focus:border-border-hover">
            <option value="br_stock" className="bg-bg">Ação BR</option>
            <option value="fii" className="bg-bg">FII</option>
            <option value="us_stock" className="bg-bg">Ação US</option>
            <option value="us_etf" className="bg-bg">ETF US</option>
            <option value="bdr" className="bg-bg">BDR</option>
          </select>
          <input type="number" placeholder="Qtd" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <input type="number" placeholder="PM" value={form.avg_price} onChange={e => setForm({ ...form, avg_price: e.target.value })}
            className="px-3 py-2 bg-bg border border-border rounded-md text-sm text-text-primary placeholder-text-faint focus:border-border-hover" />
          <button onClick={() => createMut.mutate()} disabled={!form.ticker || !form.quantity || !form.avg_price}
            className="py-2 bg-text-primary text-bg rounded-md text-sm font-medium hover:bg-white disabled:opacity-30">Salvar</button>
        </div>
      )}

      {positions && positions.length > 0 ? (
        <div>
          <div className="grid grid-cols-6 gap-3 px-3 py-2 text-[11px] text-text-muted">
            <span>Ticker</span><span>Tipo</span><span className="text-right">Qtd</span><span className="text-right">PM</span><span className="text-right">Total</span><span />
          </div>
          {positions.map(p => (
            <div key={p.id} className="grid grid-cols-6 gap-3 items-center py-2.5 px-3 -mx-3 rounded-lg hover:bg-bg-hover transition-colors">
              <span className="text-sm font-medium text-text-primary">{p.ticker}</span>
              <Badge type={p.asset_type} />
              <span className="text-sm text-text-primary text-right tabular-nums">{p.quantity}</span>
              <span className="text-sm text-text-primary text-right tabular-nums">R$ {p.avg_price.toFixed(2)}</span>
              <span className="text-sm text-text-primary text-right tabular-nums">R$ {(p.quantity * p.avg_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <div className="text-right">
                <button onClick={() => { if (confirm('Remover?')) delMut.mutate(p.id); }} className="p-1 text-text-faint hover:text-loss"><X size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-text-muted py-16">Nenhuma posição. Importe ou adicione.</p>
      )}
    </div>
  );
}
