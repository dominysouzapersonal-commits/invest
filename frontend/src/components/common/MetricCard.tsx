interface MetricCardProps {
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
  positive?: boolean | null;
}

export default function MetricCard({ label, value, suffix = '', positive }: MetricCardProps) {
  const colorClass =
    positive === true ? 'text-gain' :
    positive === false ? 'text-loss' :
    'text-text-primary';

  return (
    <div className="py-2">
      <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-[17px] font-semibold tabular-nums ${colorClass}`}>
        {value != null ? `${value}${suffix}` : '—'}
      </p>
    </div>
  );
}
