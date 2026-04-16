import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Plus, X } from 'lucide-react';
import { portfolioApi } from '../services/api';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', asset_type: 'br_stock', quantity: '', avg_price: '' });

  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: portfolioApi.getPositions,
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => portfolioApi.importFile(file),
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: () => portfolioApi.createPosition({
      ticker: form.ticker.toUpperCase(),
      asset_type: form.asset_type,
      quantity: parseFloat(form.quantity),
      avg_price: parseFloat(form.avg_price),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setForm({ ticker: '', asset_type: 'br_stock', quantity: '', avg_price: '' });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => portfolioApi.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-bold text-white tracking-tight">Portfolio</h2>
        <div className="flex gap-3">
          <label className="px-5 py-2.5 border border-border text-text-secondary rounded-full text-[13px] font-medium cursor-pointer hover:text-white hover:border-border-hover transition-all flex items-center gap-2">
            <Upload size={14} />
            Importar XP
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-white text-black rounded-full text-[13px] font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      {importMutation.isPending && <Loading text="Importando..." />}

      {showForm && (
        <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="text" placeholder="Ticker"
              value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
            />
            <select
              value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white text-[15px] focus:border-text-secondary"
            >
              <option value="br_stock" className="bg-bg-card">Ação BR</option>
              <option value="fii" className="bg-bg-card">FII</option>
              <option value="us_stock" className="bg-bg-card">Ação US</option>
              <option value="us_etf" className="bg-bg-card">ETF US</option>
              <option value="bdr" className="bg-bg-card">BDR</option>
            </select>
            <input
              type="number" placeholder="Quantidade"
              value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
            />
            <input
              type="number" placeholder="Preço Médio"
              value={form.avg_price} onChange={e => setForm({ ...form, avg_price: e.target.value })}
              className="px-0 py-3 bg-transparent border-b border-border text-white placeholder-text-muted text-[15px] focus:border-text-secondary"
            />
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.ticker || !form.quantity || !form.avg_price}
              className="py-3 bg-white text-black rounded-full text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 transition-all"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {positions && positions.length > 0 ? (
        <div className="space-y-1">
          <div className="grid grid-cols-6 gap-4 px-4 py-2">
            <span className="text-[11px] text-text-muted uppercase tracking-widest">Ticker</span>
            <span className="text-[11px] text-text-muted uppercase tracking-widest">Tipo</span>
            <span className="text-[11px] text-text-muted uppercase tracking-widest text-right">Qtd</span>
            <span className="text-[11px] text-text-muted uppercase tracking-widest text-right">PM</span>
            <span className="text-[11px] text-text-muted uppercase tracking-widest text-right">Total</span>
            <span />
          </div>
          {positions.map(pos => (
            <div key={pos.id} className="grid grid-cols-6 gap-4 items-center py-4 px-4 -mx-4 rounded-xl hover:bg-white/[0.03] transition-all">
              <span className="text-[15px] font-semibold text-white">{pos.ticker}</span>
              <Badge type={pos.asset_type} />
              <span className="text-[15px] text-white text-right tabular-nums">{pos.quantity}</span>
              <span className="text-[15px] text-white text-right tabular-nums">R$ {pos.avg_price.toFixed(2)}</span>
              <span className="text-[15px] text-white text-right tabular-nums">
                R$ {(pos.quantity * pos.avg_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="text-right">
                <button
                  onClick={() => { if (confirm('Remover?')) deleteMutation.mutate(pos.id); }}
                  className="p-1.5 text-text-faint hover:text-loss transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-text-muted text-[15px]">Nenhuma posição.</p>
          <p className="text-text-faint text-[13px] mt-1">Importe seu extrato ou adicione manualmente.</p>
        </div>
      )}
    </div>
  );
}
