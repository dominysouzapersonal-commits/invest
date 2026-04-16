interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function color(s: number) {
  if (s >= 80) return '#3ecf8e';
  if (s >= 60) return '#ededed';
  if (s >= 40) return '#888888';
  return '#f04438';
}

export default function ScoreGauge({ score, size = 'md', showLabel = true }: Props) {
  const c = color(score);
  const text = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  const w = size === 'lg' ? 'w-20' : size === 'md' ? 'w-14' : 'w-10';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`${text} font-semibold tabular-nums`} style={{ color: c }}>{score.toFixed(0)}</span>
      <div className={`${w} h-px bg-border rounded-full overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: c }} />
      </div>
      {showLabel && <span className="text-[10px] text-text-faint">/100</span>}
    </div>
  );
}
