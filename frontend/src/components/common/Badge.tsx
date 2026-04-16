import { ASSET_TYPE_LABELS } from '../../types';

interface BadgeProps {
  type: string;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  br_stock: 'bg-blue-500/20 text-blue-400',
  fii: 'bg-purple-500/20 text-purple-400',
  us_stock: 'bg-emerald-500/20 text-emerald-400',
  us_etf: 'bg-cyan-500/20 text-cyan-400',
  bdr: 'bg-amber-500/20 text-amber-400',
};

export default function Badge({ type, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[type] || 'bg-gray-500/20 text-gray-400'} ${className}`}>
      {ASSET_TYPE_LABELS[type] || type}
    </span>
  );
}
