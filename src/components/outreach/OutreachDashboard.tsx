import { useEffect, useState } from "react";
import { apiErrorMessage, outreachApi } from "../../api";
import Card from "../Card";
import { Badge } from "../Field";
import type { OutreachDashboard as Dashboard, RecentSendEntry } from "../../types";

/**
 * Outreach dashboard — overview of sends, opens, replies, and per-account stats.
 */
const OutreachDashboard = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await outreachApi.dashboard();
      setDashboard(data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load dashboard"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-ink-faint">Loading…</div>;
  if (error)
    return (
      <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
        {error}
      </div>
    );
  if (!dashboard) return null;

  const openRate = dashboard.sent_total
    ? Math.round((dashboard.opened_total / dashboard.sent_total) * 100)
    : 0;
  const replyRate = dashboard.sent_total
    ? Math.round((dashboard.replied_total / dashboard.sent_total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Sent (total)"
          value={dashboard.sent_total}
          subtext={`${dashboard.sent_today} today`}
        />
        <StatCard
          label="Opened"
          value={dashboard.opened_total}
          subtext={`${openRate}% open rate`}
          tone={openRate > 30 ? "success" : openRate > 15 ? "warn" : "neutral"}
        />
        <StatCard
          label="Replied"
          value={dashboard.replied_total}
          subtext={`${replyRate}% reply rate`}
          tone={replyRate > 10 ? "success" : replyRate > 5 ? "warn" : "neutral"}
        />
        <StatCard
          label="Failed"
          value={dashboard.failed_total}
          subtext={dashboard.pending_follow_ups ? `${dashboard.pending_follow_ups} pending follow-ups` : ""}
          tone={dashboard.failed_total > 0 ? "warn" : "neutral"}
        />
      </div>

      {dashboard.accounts.length > 0 && (
        <Card title="Account summary">
          <div className="space-y-2">
            {dashboard.accounts.map((a) => (
              <div key={a.email_account_id} className="flex items-center justify-between border-b border-line py-2 last:border-b-0">
                <div className="text-sm">
                  <div className="font-medium text-ink">{a.email_address}</div>
                  <div className="text-xs text-ink-faint">
                    {a.sent_today}/{a.daily_cap} sent today
                    {a.last_used_at && ` · last used ${new Date(a.last_used_at).toLocaleTimeString()}`}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    tone={
                      a.sent_today >= a.daily_cap
                        ? "warn"
                        : a.sent_today > 0
                        ? "info"
                        : "neutral"
                    }
                  >
                    {Math.max(a.daily_cap - a.sent_today, 0)} left
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {dashboard.recent_sends.length > 0 && (
        <Card title="Recent sends">
          <RecentSendsList sends={dashboard.recent_sends} />
        </Card>
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  subtext?: string;
  tone?: "success" | "warn" | "neutral";
}

const StatCard = ({ label, value, subtext, tone = "neutral" }: StatCardProps) => {
  const bgColor =
    tone === "success"
      ? "bg-[rgba(74,222,128,0.1)]"
      : tone === "warn"
      ? "bg-[rgba(245,196,81,0.1)]"
      : "bg-panel-2";
  const textColor =
    tone === "success"
      ? "text-success"
      : tone === "warn"
      ? "text-warn"
      : "text-ink-dim";
  return (
    <div className={`rounded-lg border border-line-2 ${bgColor} p-4`}>
      <div className={`text-xs font-medium ${textColor} opacity-75`}>{label}</div>
      <div className={`mt-1 text-3xl font-bold ${textColor}`}>{value}</div>
      {subtext && <div className={`mt-1 text-xs ${textColor}`}>{subtext}</div>}
    </div>
  );
};

const RecentSendsList = ({ sends }: { sends: RecentSendEntry[] }) => {
  const statusBadge = (status: string) => {
    const tones: Record<string, "success" | "warn" | "danger" | "neutral"> = {
      sent: "neutral",
      opened: "success",
      replied: "success",
      failed: "danger",
      bounced: "danger",
    };
    return tones[status] || "neutral";
  };
  return (
    <ul className="space-y-2 text-sm">
      {sends.slice(0, 10).map((s) => (
        <li key={s.id} className="flex items-start justify-between gap-2 border-b border-line py-2 last:border-b-0">
          <div>
            <div className="font-medium text-ink">{s.recipient}</div>
            <div className="text-xs text-ink-faint">{s.subject}</div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            <Badge tone={statusBadge(s.status)}>{s.status}</Badge>
            <div className="text-xs text-ink-faint">
              {new Date(s.created_at).toLocaleString()}
            </div>
            {s.opened_at && (
              <div className="text-xs text-success">
                Opened {new Date(s.opened_at).toLocaleString()}
              </div>
            )}
            {s.replied_at && (
              <div className="text-xs text-success">
                Replied {new Date(s.replied_at).toLocaleString()}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default OutreachDashboard;
