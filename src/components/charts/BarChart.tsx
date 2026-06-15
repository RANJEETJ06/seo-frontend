export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  color?: string;
  /** Max bars to render (top-N by value). */
  limit?: number;
  formatValue?: (v: number) => string;
}

/**
 * Dependency-free horizontal bar chart for "top-N" breakdowns. Each row is a
 * label + a proportional bar + the formatted value, so it doubles as a compact
 * ranked list.
 */
const BarChart = ({ data, color = "var(--color-signal-bright, #34d399)", limit = 10, formatValue }: BarChartProps) => {
  const fmt = formatValue ?? ((v: number) => Math.round(v).toLocaleString());
  const rows = [...data].sort((a, b) => b.value - a.value).slice(0, limit);
  const max = rows.length ? Math.max(...rows.map((r) => r.value)) : 1;

  if (rows.length === 0) {
    return <div className="grid h-24 place-items-center text-sm text-ink-faint">No data.</div>;
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-40 shrink-0 truncate text-xs text-ink-dim" title={r.label}>
            {r.label || "(not set)"}
          </div>
          <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-panel-2">
            <div
              className="absolute inset-y-0 left-0 rounded-md"
              style={{ width: `${max > 0 ? (r.value / max) * 100 : 0}%`, backgroundColor: color, opacity: 0.85 }}
            />
          </div>
          <div className="w-16 shrink-0 text-right text-xs font-medium text-ink-dim tabular-nums">
            {fmt(r.value)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
