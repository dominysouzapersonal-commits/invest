interface Props {
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
  positive?: boolean | null;
}

export default function MetricCard({ label, value, suffix = '', positive }: Props) {
  const c = positive === true ? 'text-gain' : positive === false ? 'text-loss' : 'text-text-primary';
  return (
    <div className="py-1.5">
      <p className="text-[11px] text-text-muted mb-0.5">{label}</p>
      <p className={`text-sm font-medium tabular-nums ${c}`}>{value != null ? `${value}${suffix}` : '—'}</p>
    </div>
  );
}
