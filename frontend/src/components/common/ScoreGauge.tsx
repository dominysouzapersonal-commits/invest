interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#fafafa';
  if (score >= 60) return '#a1a1aa';
  if (score >= 40) return '#71717a';
  if (score >= 20) return '#ef4444';
  return '#ef4444';
}

export default function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const width = size === 'lg' ? 'w-32' : size === 'md' ? 'w-24' : 'w-16';
  const textSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg';
  const barHeight = size === 'lg' ? 'h-1' : 'h-0.5';

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`${textSize} font-bold tracking-tight`} style={{ color }}>
        {score.toFixed(0)}
      </span>
      <div className={`${width} ${barHeight} bg-border rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] text-text-muted">/100</span>
      )}
    </div>
  );
}
