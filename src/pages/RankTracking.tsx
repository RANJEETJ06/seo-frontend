import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  rankTrackingApi,
  searchConsoleApi,
  apiErrorMessage,
} from "../api";
import { useProjectsStore } from "../store/projects";
import Card from "../components/Card";
import { Field, Button, Badge } from "../components/Field";
import LineChart from "../components/charts/LineChart";
import type {
  GSCConnection,
  RankSummaryItem,
  RankSummaryResponse,
  RankTarget,
} from "../types";

const statusTone = (s: RankSummaryItem["status"]) =>
  s === "improved"
    ? "success"
    : s === "declined"
    ? "danger"
    : s === "new"
    ? "info"
    : "neutral";

const RankTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: projects, fetch: fetchProjects } = useProjectsStore();
  const [projectId, setProjectId] = useState<string>(
    searchParams.get("project") ?? ""
  );

  const [targets, setTargets] = useState<RankTarget[]>([]);
  const [summary, setSummary] = useState<RankSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const loadAll = async (pid: number) => {
    setLoading(true);
    setError(null);
    try {
      const [t, s] = await Promise.all([
        rankTrackingApi.listTargets(pid),
        rankTrackingApi.summary(pid),
      ]);
      setTargets(t);
      setSummary(s);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load rank tracking"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) {
      setTargets([]);
      setSummary(null);
      return;
    }
    void loadAll(Number(projectId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSelectProject = (id: string) => {
    setProjectId(id);
    setNotice(null);
    setSearchParams(id ? { project: id } : {});
  };

  const captureAll = async () => {
    if (!targets.length) return;
    setCapturing(true);
    setNotice(null);
    setError(null);
    try {
      let total = 0;
      for (const t of targets) {
        const res = await rankTrackingApi.capture(t.id);
        total += res.captured;
      }
      setNotice(`Captured ${total} keyword position(s) from the latest available day.`);
      await loadAll(Number(projectId));
    } catch (err) {
      setError(apiErrorMessage(err, "Capture failed"));
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Rank Tracking</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Daily keyword positions from Google Search Console — with an
          explanation whenever a ranking drops.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Project">
            <select
              value={projectId}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20"
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.domain})
                </option>
              ))}
            </select>
          </Field>
          {projectId && (
            <div className="flex items-end">
              <Button
                onClick={captureAll}
                disabled={capturing || targets.length === 0}
                className="w-full"
              >
                {capturing ? "Capturing…" : "Capture latest positions"}
              </Button>
            </div>
          )}
        </div>
        {notice && (
          <div className="mt-3 rounded-md bg-[rgba(74,222,128,0.1)] px-3 py-2 text-sm text-success">
            {notice}
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
      </Card>

      {projectId && (
        <AddTarget
          projectId={Number(projectId)}
          targets={targets}
          onChange={() => loadAll(Number(projectId))}
        />
      )}

      {loading && (
        <Card>
          <div className="py-8 text-center text-sm text-ink-faint">Loading…</div>
        </Card>
      )}

      {summary && summary.trend.length > 1 && (
        <Card title="Average position trend">
          <TrendChart trend={summary.trend} />
        </Card>
      )}

      {summary && (
        <SummaryTable items={summary.items} />
      )}
    </div>
  );
};

const TrendChart = ({
  trend,
}: {
  trend: { date: string; position: number }[];
}) => {
  // Position is "lower is better" — invert so the line rising = improving.
  const labels = trend.map((p) => p.date.slice(5));
  const series = [
    {
      name: "Avg position",
      color: "#6366F1",
      values: trend.map((p) => p.position),
    },
  ];
  return (
    <div>
      <LineChart
        labels={labels}
        series={series}
        formatValue={(v) => `#${v.toFixed(1)}`}
      />
      <p className="mt-2 text-xs text-ink-faint">
        Lower is better (position #1 is the top of Google). A rising line means
        rankings are slipping.
      </p>
    </div>
  );
};

const AddTarget = ({
  projectId,
  targets,
  onChange,
}: {
  projectId: number;
  targets: RankTarget[];
  onChange: () => void;
}) => {
  const [connections, setConnections] = useState<GSCConnection[]>([]);
  const [connectionId, setConnectionId] = useState<string>("");
  const [sites, setSites] = useState<string[]>([]);
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    searchConsoleApi
      .listConnections()
      .then(setConnections)
      .catch(() => setConnections([]));
  }, []);

  useEffect(() => {
    if (!connectionId) {
      setSites([]);
      return;
    }
    searchConsoleApi
      .listSites(Number(connectionId))
      .then((r) => setSites(r.sites.map((s) => s.site_url)))
      .catch((err) => setError(apiErrorMessage(err, "Could not load sites")));
  }, [connectionId]);

  const add = async () => {
    if (!connectionId || !siteUrl) return;
    setBusy(true);
    setError(null);
    try {
      await rankTrackingApi.createTarget({
        project_id: projectId,
        connection_id: Number(connectionId),
        site_url: siteUrl,
      });
      setSiteUrl("");
      onChange();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not add target"));
    } finally {
      setBusy(false);
    }
  };

  const removeTarget = async (id: number) => {
    await rankTrackingApi.deleteTarget(id);
    onChange();
  };

  return (
    <Card title="Tracked sites">
      {connections.length === 0 ? (
        <p className="text-sm text-ink-faint">
          Connect a Google Search Console account first (Search Console page),
          then add a verified site to track here.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="GSC account">
            <select
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              className="w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm"
            >
              <option value="">Select account…</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.account_email}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Verified site">
            <select
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              disabled={!sites.length}
              className="w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">{sites.length ? "Select site…" : "—"}</option>
              {sites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            <Button onClick={add} disabled={busy || !siteUrl} className="w-full">
              {busy ? "Adding…" : "Track site"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {targets.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {targets.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2"
            >
              <span className="truncate text-ink-dim">{t.site_url}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-ink-faint">
                  {t.last_captured_on
                    ? `last: ${t.last_captured_on}`
                    : "no snapshots yet"}
                </span>
                <button
                  onClick={() => removeTarget(t.id)}
                  className="text-xs font-medium text-danger hover:underline"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const SummaryTable = ({ items }: { items: RankSummaryItem[] }) => {
  const [open, setOpen] = useState<string | null>(null);
  const declines = useMemo(
    () => items.filter((i) => i.status === "declined").length,
    [items]
  );

  if (items.length === 0) {
    return (
      <Card title="Tracked keywords">
        <p className="py-6 text-center text-sm text-ink-faint">
          No snapshots yet. Add a site above and click “Capture latest
          positions”. (Search Console data lags ~2 days.)
        </p>
      </Card>
    );
  }

  return (
    <Card
      title={`Tracked keywords (${items.length})`}
      action={
        declines > 0 ? (
          <Badge tone="danger">{declines} declining</Badge>
        ) : (
          <Badge tone="success">No drops</Badge>
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-2 py-2">Query</th>
              <th className="px-2 py-2">Position</th>
              <th className="px-2 py-2">Change</th>
              <th className="px-2 py-2">Impressions</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const expandable = it.reasons.length > 0;
              const isOpen = open === it.query;
              return (
                <Fragment key={it.query}>
                  <tr className="border-t border-line">
                    <td className="max-w-xs truncate px-2 py-2 font-medium text-ink-dim">
                      {it.query}
                    </td>
                    <td className="px-2 py-2 text-ink">
                      #{it.current_position.toFixed(1)}
                    </td>
                    <td className="px-2 py-2">
                      <ChangeBadge change={it.change} />
                    </td>
                    <td className="px-2 py-2 text-ink-dim">
                      {it.impressions.toLocaleString()}
                    </td>
                    <td className="px-2 py-2">
                      <Badge tone={statusTone(it.status)}>{it.status}</Badge>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {expandable && (
                        <button
                          onClick={() => setOpen(isOpen ? null : it.query)}
                          className="text-xs font-medium text-signal hover:underline"
                        >
                          {isOpen ? "Hide why" : "Why?"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandable && isOpen && (
                    <tr className="border-t border-line bg-panel-2/50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="text-xs font-semibold text-danger">
                          Why this ranking dropped
                        </div>
                        <ul className="mt-1 space-y-1 text-xs text-ink-dim">
                          {it.reasons.map((r, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-danger">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const ChangeBadge = ({ change }: { change?: number | null }) => {
  if (change === null || change === undefined)
    return <Badge tone="info">new</Badge>;
  if (change > 0) return <Badge tone="success">▲ {change.toFixed(1)}</Badge>;
  if (change < 0) return <Badge tone="danger">▼ {Math.abs(change).toFixed(1)}</Badge>;
  return <Badge tone="neutral">0</Badge>;
};

export default RankTracking;
