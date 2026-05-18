interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

function colorFor(score: number) {
  if (score >= 80) return "text-emerald-600 stroke-emerald-500";
  if (score >= 60) return "text-amber-600 stroke-amber-500";
  if (score >= 40) return "text-orange-600 stroke-orange-500";
  return "text-rose-600 stroke-rose-500";
}

const ScoreGauge = ({ score, label, size = "md" }: ScoreGaugeProps) => {
  const clamped = Math.max(0, Math.min(100, score));
  const dim = size === "sm" ? 64 : size === "lg" ? 144 : 96;
  const stroke = size === "sm" ? 6 : 10;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const color = colorFor(clamped);
  const fontSize = size === "sm" ? "text-sm" : size === "lg" ? "text-3xl" : "text-xl";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-slate-100"
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
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center font-semibold ${fontSize} ${color}`}
        >
          {Math.round(clamped)}
        </div>
      </div>
      {label && (
        <div className="mt-2 text-xs font-medium text-slate-600">{label}</div>
      )}
    </div>
  );
};

export default ScoreGauge;
