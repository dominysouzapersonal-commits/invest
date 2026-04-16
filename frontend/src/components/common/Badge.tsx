import { ASSET_TYPE_LABELS } from '../../types';

interface BadgeProps {
  type: string;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  br_stock: 'text-blue-400',
  fii: 'text-purple-400',
  us_stock: 'text-emerald-400',
  us_etf: 'text-cyan-400',
  bdr: 'text-amber-400',
};

export default function Badge({ type, className = '' }: BadgeProps) {
  return (
    <span className={`text-[11px] font-medium uppercase tracking-wider ${TYPE_COLORS[type] || 'text-text-muted'} ${className}`}>
      {ASSET_TYPE_LABELS[type] || type}
    </span>
  );
}
