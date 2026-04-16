interface MetricCardProps {
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
  positive?: boolean | null;
}

export default function MetricCard({ label, value, suffix = '', positive }: MetricCardProps) {
  const colorClass =
    positive === true ? 'text-success' :
    positive === false ? 'text-danger' :
    'text-white';

  return (
    <div className="bg-dark-bg/50 rounded-lg p-3 border border-dark-border/50">
      <p className="text-xs text-dark-muted mb-1">{label}</p>
      <p className={`text-lg font-semibold ${colorClass}`}>
        {value != null ? `${value}${suffix}` : '—'}
      </p>
    </div>
  );
}
