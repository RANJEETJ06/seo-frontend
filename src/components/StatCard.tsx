import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

/** Compact KPI tile used in the Overview dashboards. */
const StatCard = ({ label, value, hint }: StatCardProps) => (
  <div className="rounded-2xl border border-line bg-panel p-4 shadow-panel">
    <div className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
      {label}
    </div>
    <div className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">{value}</div>
    {hint && <div className="mt-0.5 text-xs text-ink-faint">{hint}</div>}
  </div>
);

export default StatCard;
