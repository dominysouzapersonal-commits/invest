interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

const SIZES = { sm: 60, md: 90, lg: 130 };

export default function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const dim = SIZES[size];
  const stroke = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const fontSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke="#2a2d3a" strokeWidth={stroke}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <text
          x={dim / 2} y={dim / 2}
          textAnchor="middle" dominantBaseline="central"
          fill={color} fontWeight="bold"
          fontSize={size === 'lg' ? 28 : size === 'md' ? 20 : 14}
          className="rotate-90 origin-center"
        >
          {score.toFixed(0)}
        </text>
      </svg>
      {showLabel && (
        <span className={`${fontSize} font-semibold`} style={{ color }}>
          /100
        </span>
      )}
    </div>
  );
}
