import { useEffect, useMemo, useState } from "react";
import { analyticsApi, apiErrorMessage } from "../api";
import Card from "../components/Card";
import { Field, Button, Badge } from "../components/Field";
import type { GAConnection, GAProperty, GAReportRow } from "../types";

const DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 28 days", days: 28 },
  { label: "Last 3 months", days: 90 },
];

const DIMENSIONS = [
  { value: "sessionDefaultChannelGroup", label: "Channel" },
  { value: "landingPagePlusQueryString", label: "Landing page" },
  { value: "pagePath", label: "Page path" },
  { value: "country", label: "Country" },
  { value: "deviceCategory", label: "Device" },
];

const selectClass =
  "w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20";

const Analytics = () => {
  const [connections, setConnections] = useState<GAConnection[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [connectionId, setConnectionId] = useState<number | null>(null);

  const [properties, setProperties] = useState<GAProperty[]>([]);
  const [property, setProperty] = useState("");
  const [days, setDays] = useState(28);
  const [dimension, setDimension] = useState("sessionDefaultChannelGroup");

  const [rows, setRows] = useState<GAReportRow[]>([]);
  const [totals, setTotals] = useState<{ sessions: number; users: number; views: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConn = useMemo(
    () => connections.find((c) => c.id === connectionId) ?? null,
    [connections, connectionId]
  );

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoadingConns(true);
    try {
      const conns = await analyticsApi.listConnections();
      setConnections(conns);
      if (conns.length > 0) setConnectionId((prev) => prev ?? conns[0].id);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load connections"));
    } finally {
      setLoadingConns(false);
    }
  };

  useEffect(() => {
    if (!connectionId) {
      setProperties([]);
      setProperty("");
      return;
    }
    setError(null);
    analyticsApi
      .listProperties(connectionId)
      .then((res) => {
        setProperties(res.properties);
        setProperty((prev) => prev || res.properties[0]?.property || "");
      })
      .catch((err) => setError(apiErrorMessage(err, "Failed to load properties")));
  }, [connectionId]);

  const handleConnect = async () => {
    setError(null);
    try {
      const redirect = `${window.location.origin}/oauth/google/analytics/callback`;
      const { auth_url } = await analyticsApi.getAuthUrl(redirect);
      window.location.href = auth_url;
    } catch (err) {
      setError(apiErrorMessage(err, "Could not start Google sign-in"));
    }
  };

  const handleDisconnect = async (id: number) => {
    try {
      await analyticsApi.disconnect(id);
      if (connectionId === id) setConnectionId(null);
      await loadConnections();
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to disconnect"));
    }
  };

  const handleRunReport = async () => {
    if (!connectionId || !property) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.report({
        connection_id: connectionId,
        property,
        days,
        dimension,
        limit: 100,
      });
      setRows(res.rows);
      setTotals({
        sessions: res.total_sessions,
        users: res.total_users,
        views: res.total_screen_page_views,
      });
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to run report"));
    } finally {
      setLoading(false);
    }
  };

  const dimensionLabel = DIMENSIONS.find((d) => d.value === dimension)?.label ?? "Dimension";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Google Analytics</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Connect Google Analytics 4 to see traffic — sessions, users, pageviews
          and engagement — broken down by channel, landing page and more.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Connections */}
      <Card
        title="Connected accounts"
        action={
          <Button variant="secondary" onClick={handleConnect}>
            + Connect Google account
          </Button>
        }
      >
        {loadingConns ? (
          <div className="py-6 text-center text-sm text-ink-faint">Loading…</div>
        ) : connections.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-faint">
            No Analytics accounts connected yet. Connect one to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  c.id === connectionId ? "border-signal bg-signal-soft" : "border-line-2"
                }`}
              >
                <button className="flex-1 text-left" onClick={() => setConnectionId(c.id)}>
                  <div className="text-sm font-medium text-ink">{c.account_email}</div>
                  {c.last_error && (
                    <div className="mt-0.5 text-xs text-danger">{c.last_error}</div>
                  )}
                </button>
                <div className="flex items-center gap-3">
                  {c.id === connectionId && <Badge tone="info">Active</Badge>}
                  <Button variant="ghost" onClick={() => handleDisconnect(c.id)}>
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Property + range controls */}
      {activeConn && (
        <Card title="Traffic report">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Property">
              <select
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className={selectClass}
              >
                <option value="">Select a property…</option>
                {properties.map((p) => (
                  <option key={p.property} value={p.property}>
                    {p.display_name || p.property}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Break down by">
              <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                className={selectClass}
              >
                {DIMENSIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date range">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className={selectClass}
              >
                {DATE_RANGES.map((r) => (
                  <option key={r.days} value={r.days}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <Button onClick={handleRunReport} disabled={loading || !property} className="w-full">
                {loading ? "Loading…" : "Run report"}
              </Button>
            </div>
          </div>

          {totals && (
            <div className="mt-4 flex gap-6 border-t border-line pt-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-faint">Sessions</div>
                <div className="text-lg font-semibold text-ink">
                  {totals.sessions.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-faint">Users</div>
                <div className="text-lg font-semibold text-ink">
                  {totals.users.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-faint">Pageviews</div>
                <div className="text-lg font-semibold text-ink">
                  {totals.views.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Report table */}
      {rows.length > 0 && (
        <Card title={`${dimensionLabel} breakdown (${rows.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-2 py-2">{dimensionLabel}</th>
                  <th className="px-2 py-2">Sessions</th>
                  <th className="px-2 py-2">Users</th>
                  <th className="px-2 py-2">Pageviews</th>
                  <th className="px-2 py-2">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-2 py-2 font-medium text-ink-dim">{r.dimension}</td>
                    <td className="px-2 py-2 text-ink-dim">{r.sessions.toLocaleString()}</td>
                    <td className="px-2 py-2 text-ink-dim">{r.total_users.toLocaleString()}</td>
                    <td className="px-2 py-2 text-ink-dim">
                      {r.screen_page_views.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-ink-dim">
                      {(r.engagement_rate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
