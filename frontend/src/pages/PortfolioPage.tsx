import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { portfolioApi } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
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
    onError: () => alert('Erro ao importar arquivo.'),
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
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
      setForm({ ticker: '', asset_type: 'br_stock', quantity: '', avg_price: '' });
      setShowAddForm(false);
    },
    onError: () => alert('Erro ao criar posição.'),
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Portfolio</h2>
        <div className="flex gap-3">
          <label className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg cursor-pointer hover:bg-dark-border/50 transition-colors flex items-center gap-2 text-sm font-medium">
            <Upload size={16} />
            Importar XP
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>
      </div>

      {importMutation.isPending && <Loading text="Importando extrato XP..." />}

      {/* Add form */}
      {showAddForm && (
        <Card className="mb-6">
          <h3 className="text-white font-medium mb-4">Nova Posição</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="text" placeholder="Ticker (ex: PETR4)"
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
              type="number" placeholder="Quantidade"
              value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
            />
            <input
              type="number" placeholder="Preço Médio"
              value={form.avg_price} onChange={e => setForm({ ...form, avg_price: e.target.value })}
              className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-muted focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.ticker || !form.quantity || !form.avg_price}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Salvar
            </button>
          </div>
        </Card>
      )}

      {/* Positions table */}
      <Card>
        {positions && positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-2 text-sm text-dark-muted font-medium">Ticker</th>
                  <th className="text-left py-3 px-2 text-sm text-dark-muted font-medium">Tipo</th>
                  <th className="text-right py-3 px-2 text-sm text-dark-muted font-medium">Qtd</th>
                  <th className="text-right py-3 px-2 text-sm text-dark-muted font-medium">Preço Médio</th>
                  <th className="text-right py-3 px-2 text-sm text-dark-muted font-medium">Total Investido</th>
                  <th className="text-center py-3 px-2 text-sm text-dark-muted font-medium">Corretora</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.id} className="border-b border-dark-border/50 hover:bg-dark-bg/30">
                    <td className="py-3 px-2 text-white font-medium">{pos.ticker}</td>
                    <td className="py-3 px-2"><Badge type={pos.asset_type} /></td>
                    <td className="py-3 px-2 text-right text-white">{pos.quantity}</td>
                    <td className="py-3 px-2 text-right text-white">R$ {pos.avg_price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right text-white">
                      R$ {(pos.quantity * pos.avg_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-center text-dark-muted text-sm">{pos.broker}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => { if (confirm('Remover posição?')) deleteMutation.mutate(pos.id); }}
                        className="p-1.5 rounded hover:bg-danger/20 transition-colors"
                      >
                        <Trash2 size={14} className="text-dark-muted hover:text-danger" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-dark-muted">Nenhuma posição encontrada.</p>
            <p className="text-sm text-dark-muted mt-1">Importe seu extrato da XP ou adicione posições manualmente.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
