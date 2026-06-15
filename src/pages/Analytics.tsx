import { useEffect, useMemo, useState } from "react";
import { analyticsApi, apiErrorMessage } from "../api";
import Card from "../components/Card";
import { Field, Button, Badge } from "../components/Field";
import SubNav, { type SubNavItem } from "../components/SubNav";
import StatCard from "../components/StatCard";
import LineChart from "../components/charts/LineChart";
import BarChart from "../components/charts/BarChart";
import type { GAConnection, GAProperty, GAReportResponse, GAReportRow } from "../types";

type View = "overview" | "acquisition" | "pages" | "geography" | "devices" | "conversions" | "connections";

const NAV: SubNavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "acquisition", label: "Acquisition" },
  { id: "pages", label: "Pages" },
  { id: "conversions", label: "Conversions" },
  { id: "geography", label: "Geography" },
  { id: "devices", label: "Devices" },
  { id: "connections", label: "Connections" },
];

const DIMENSION: Record<Exclude<View, "connections" | "overview">, string> = {
  acquisition: "sessionDefaultChannelGroup",
  pages: "pagePath",
  conversions: "pagePath",
  geography: "country",
  devices: "deviceCategory",
};

const COL_LABEL: Record<string, string> = {
  acquisition: "Channel",
  pages: "Page",
  conversions: "Page",
  geography: "Country",
  devices: "Device",
};

const DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 28 days", days: 28 },
  { label: "Last 3 months", days: 90 },
];

const selectClass =
  "w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20";

const fmtInt = (v: number) => Math.round(v).toLocaleString();
const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;
const fmtDuration = (s: number) => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
const fmtGaDate = (d: string) => {
  // GA4 date dimension is "YYYYMMDD".
  if (/^\d{8}$/.test(d)) {
    const dt = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`);
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return d;
};

const Analytics = () => {
  const [connections, setConnections] = useState<GAConnection[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [properties, setProperties] = useState<GAProperty[]>([]);
  const [property, setProperty] = useState("");
  const [days, setDays] = useState(28);
  const [view, setView] = useState<View>("overview");

  const [data, setData] = useState<GAReportResponse | null>(null);
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

  useEffect(() => {
    if (view === "connections" || !connectionId || !property) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const dimension = view === "overview" ? "date" : DIMENSION[view];
    const limit = view === "overview" ? days + 10 : 200;
    analyticsApi
      .report({ connection_id: connectionId, property, days, dimension, limit })
      .then((res) => {
        if (cancelled) return;
        if (view === "overview") res.rows = [...res.rows].sort((a, b) => a.dimension.localeCompare(b.dimension));
        else if (view === "conversions") res.rows = [...res.rows].sort((a, b) => b.conversions - a.conversions);
        setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, "Failed to load data"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view, connectionId, property, days]);

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

  const renderControls = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Property">
        <select value={property} onChange={(e) => setProperty(e.target.value)} className={selectClass}>
          <option value="">Select a property…</option>
          {properties.map((p) => (
            <option key={p.property} value={p.property}>
              {p.display_name || p.property}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date range">
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={selectClass}>
          {DATE_RANGES.map((r) => (
            <option key={r.days} value={r.days}>
              {r.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end text-xs text-ink-faint">
        {data && (
          <span>
            {data.start_date} → {data.end_date}
          </span>
        )}
      </div>
    </div>
  );

  const renderTable = (rows: GAReportRow[], colKey: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
          <tr>
            <th className="px-2 py-2">{COL_LABEL[colKey]}</th>
            <th className="px-2 py-2">Sessions</th>
            <th className="px-2 py-2">Users</th>
            <th className="px-2 py-2">New users</th>
            <th className="px-2 py-2">Pageviews</th>
            <th className="px-2 py-2">Bounce</th>
            <th className="px-2 py-2">Engagement</th>
            <th className="px-2 py-2">Conversions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              <td className="px-2 py-2 font-medium text-ink-dim">{r.dimension}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtInt(r.sessions)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtInt(r.total_users)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtInt(r.new_users)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtInt(r.screen_page_views)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtPct(r.bounce_rate)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtPct(r.engagement_rate)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtInt(r.conversions)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderConnections = () => (
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
                {c.last_error && <div className="mt-0.5 text-xs text-danger">{c.last_error}</div>}
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
  );

  const renderActiveView = () => {
    if (view === "connections") return renderConnections();
    if (!activeConn) {
      return (
        <Card>
          <div className="py-10 text-center text-sm text-ink-faint">
            Connect a Google Analytics account to see data.{" "}
            <button onClick={() => setView("connections")} className="text-signal underline">
              Go to Connections
            </button>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card title="Filters">{renderControls()}</Card>

        {loading && (
          <Card>
            <div className="py-10 text-center text-sm text-ink-faint">Loading…</div>
          </Card>
        )}

        {!loading && view === "overview" && data && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Sessions" value={fmtInt(data.total_sessions)} />
              <StatCard label="Users" value={fmtInt(data.total_users)} />
              <StatCard label="New users" value={fmtInt(data.total_new_users)} />
              <StatCard label="Pageviews" value={fmtInt(data.total_screen_page_views)} />
              <StatCard label="Engagement rate" value={fmtPct(data.engagement_rate)} />
              <StatCard label="Bounce rate" value={fmtPct(data.bounce_rate)} />
              <StatCard label="Avg session" value={fmtDuration(data.avg_session_duration)} />
              <StatCard label="Conversions" value={fmtInt(data.total_conversions)} />
            </div>
            <Card title="Sessions & users over time">
              <LineChart
                labels={data.rows.map((r) => fmtGaDate(r.dimension))}
                series={[
                  { name: "Sessions", color: "#34d399", values: data.rows.map((r) => r.sessions) },
                  { name: "Users", color: "#60a5fa", values: data.rows.map((r) => r.total_users) },
                ]}
              />
            </Card>
          </>
        )}

        {!loading && view !== "overview" && data && (
          <>
            <Card title={`${COL_LABEL[view]} by ${view === "conversions" ? "conversions" : "sessions"}`}>
              <BarChart
                data={data.rows.map((r) => ({
                  label: r.dimension,
                  value: view === "conversions" ? r.conversions : r.sessions,
                }))}
                color="#34d399"
                limit={view === "devices" ? 5 : 12}
              />
            </Card>
            <Card title={`${COL_LABEL[view]} (${data.rows.length})`}>{renderTable(data.rows, view)}</Card>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Google Analytics</h1>
        <p className="mt-1 text-sm text-ink-faint">
          GA4 traffic — sessions, users, engagement and pageviews — across channels, pages,
          geography and devices.
        </p>
      </div>

      {error && <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">{error}</div>}

      <div className="flex flex-col gap-6 lg:flex-row">
        <SubNav items={NAV} active={view} onSelect={(id) => setView(id as View)} title="Google Analytics" />
        <div className="min-w-0 flex-1">{renderActiveView()}</div>
      </div>
    </div>
  );
};

export default Analytics;
