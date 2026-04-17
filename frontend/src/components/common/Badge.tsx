import { ASSET_TYPE_LABELS } from '../../types';

const COLORS: Record<string, string> = {
  br_stock: 'text-blue-400/80',
  fii: 'text-purple-400/80',
  br_etf: 'text-teal-400/80',
  us_stock: 'text-emerald-400/80',
  us_etf: 'text-cyan-400/80',
  bdr: 'text-amber-400/80',
};

export default function Badge({ type, className = '' }: { type: string; className?: string }) {
  return (
    <span className={`text-[11px] font-medium ${COLORS[type] || 'text-text-muted'} ${className}`}>
      {ASSET_TYPE_LABELS[type] || type}
    </span>
  );
}
