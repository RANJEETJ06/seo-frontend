import { useId, useMemo, useState } from "react";

export interface LineSeries {
  name: string;
  color: string;
  /** Y values, one per label (same length as `labels`). */
  values: number[];
}

interface LineChartProps {
  labels: string[];
  series: LineSeries[];
  height?: number;
  /** Format a y value for the tooltip / axis (e.g. thousands). */
  formatValue?: (v: number) => string;
}

const VIEW_W = 720;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

/**
 * Lightweight, dependency-free multi-series line chart. Renders into a fixed
 * viewBox that scales to the container width (width=100%), with a y-axis grid,
 * sparse x labels and a hover crosshair + tooltip.
 */
const LineChart = ({ labels, series, height = 240, formatValue }: LineChartProps) => {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const fmt = formatValue ?? ((v: number) => Math.round(v).toLocaleString());
  const n = labels.length;

  const { maxY, plotW, plotH, x, y } = useMemo(() => {
    const allVals = series.flatMap((s) => s.values);
    const rawMax = allVals.length ? Math.max(...allVals) : 0;
    const maxY = rawMax <= 0 ? 1 : rawMax * 1.1;
    const plotW = VIEW_W - PAD.left - PAD.right;
    const plotH = height - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (plotW * i) / (n - 1));
    const yScale = (v: number) => PAD.top + plotH - (v / maxY) * plotH;
    return { maxY, plotW, plotH, x, y: yScale };
  }, [series, labels, height, n]);

  if (n === 0) {
    return (
      <div className="grid h-40 place-items-center text-sm text-ink-faint">No data for this range.</div>
    );
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  // Show at most ~7 x labels to avoid crowding.
  const labelStep = Math.max(1, Math.ceil(n / 7));

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${height}`} className="w-full" role="img" style={{ height }}>
      {/* Y grid + labels */}
      {gridLines.map((g) => {
        const yy = PAD.top + plotH - g * plotH;
        return (
          <g key={g}>
            <line x1={PAD.left} y1={yy} x2={VIEW_W - PAD.right} y2={yy} stroke="currentColor" className="text-line" strokeWidth={1} />
            <text x={PAD.left - 8} y={yy + 3} textAnchor="end" className="fill-ink-faint" fontSize={10}>
              {fmt(maxY * g)}
            </text>
          </g>
        );
      })}

      {/* X labels */}
      {labels.map((lab, i) =>
        i % labelStep === 0 ? (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-ink-faint" fontSize={10}>
            {lab}
          </text>
        ) : null
      )}

      {/* Series areas + lines */}
      {series.map((s) => {
        const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        const area = `${PAD.left},${PAD.top + plotH} ${pts} ${x(n - 1)},${PAD.top + plotH}`;
        return (
          <g key={s.name}>
            <defs>
              <linearGradient id={`grad-${gid}-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#grad-${gid}-${s.name})`} />
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })}

      {/* Hover crosshair + points */}
      {hover !== null && (
        <line x1={x(hover)} y1={PAD.top} x2={x(hover)} y2={PAD.top + plotH} stroke="currentColor" className="text-line-2" strokeWidth={1} />
      )}
      {hover !== null &&
        series.map((s) => (
          <circle key={s.name} cx={x(hover)} cy={y(s.values[hover] ?? 0)} r={3.5} fill={s.color} />
        ))}

      {/* Invisible hit areas for hover */}
      {labels.map((_, i) => (
        <rect
          key={i}
          x={x(i) - (plotW / Math.max(n - 1, 1)) / 2}
          y={PAD.top}
          width={plotW / Math.max(n - 1, 1) || plotW}
          height={plotH}
          fill="transparent"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        />
      ))}

      {/* Tooltip */}
      {hover !== null && (
        <g>
          <rect
            x={Math.min(Math.max(x(hover) - 60, PAD.left), VIEW_W - PAD.right - 120)}
            y={PAD.top}
            width={120}
            height={18 + series.length * 14}
            rx={6}
            className="fill-panel stroke-line-2"
            strokeWidth={1}
          />
          <text
            x={Math.min(Math.max(x(hover) - 60, PAD.left), VIEW_W - PAD.right - 120) + 8}
            y={PAD.top + 13}
            className="fill-ink"
            fontSize={10}
            fontWeight={600}
          >
            {labels[hover]}
          </text>
          {series.map((s, si) => (
            <text
              key={s.name}
              x={Math.min(Math.max(x(hover) - 60, PAD.left), VIEW_W - PAD.right - 120) + 8}
              y={PAD.top + 27 + si * 14}
              fontSize={10}
              fill={s.color}
            >
              {s.name}: {fmt(s.values[hover] ?? 0)}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
};

export default LineChart;
