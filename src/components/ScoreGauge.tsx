interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

function colorFor(score: number) {
  if (score >= 80) return "text-signal stroke-signal";
  if (score >= 60) return "text-warn stroke-warn";
  if (score >= 40) return "text-[#fb923c] stroke-[#fb923c]";
  return "text-danger stroke-danger";
}

const ScoreGauge = ({ score, label, size = "md" }: ScoreGaugeProps) => {
  const clamped = Math.max(0, Math.min(100, score));
  const dim = size === "sm" ? 64 : size === "lg" ? 144 : 96;
  const stroke = size === "sm" ? 6 : 10;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const color = colorFor(clamped);
  const fontSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-white/[0.07]"
            fill="none"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            className={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="none"
            style={{
              transition: "stroke-dashoffset 0.7s cubic-bezier(0.2,0.7,0.2,1)",
              filter: "drop-shadow(0 0 6px currentColor)",
            }}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-display font-semibold tabular-nums ${fontSize} ${color}`}
        >
          {Math.round(clamped)}
        </div>
      </div>
      {label && (
        <div className="mt-2.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink-dim font-mono">
          {label}
        </div>
      )}
    </div>
  );
};

export default ScoreGauge;
