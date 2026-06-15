import { useEffect, useMemo, useState } from "react";
import { searchConsoleApi, apiErrorMessage } from "../api";
import { useProjectsStore } from "../store/projects";
import Card from "../components/Card";
import { Field, Button, Badge } from "../components/Field";
import SubNav, { type SubNavItem } from "../components/SubNav";
import StatCard from "../components/StatCard";
import LineChart from "../components/charts/LineChart";
import BarChart from "../components/charts/BarChart";
import type { GSCConnection, GSCPerformanceResponse, GSCQueryRow, GSCSite } from "../types";

type View = "overview" | "queries" | "pages" | "countries" | "devices" | "connections";

const NAV: SubNavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "queries", label: "Queries" },
  { id: "pages", label: "Pages" },
  { id: "countries", label: "Countries" },
  { id: "devices", label: "Devices" },
  { id: "connections", label: "Connections" },
];

const DIMENSION: Record<Exclude<View, "connections" | "overview">, string> = {
  queries: "query",
  pages: "page",
  countries: "country",
  devices: "device",
};

const COL_LABEL: Record<string, string> = {
  queries: "Query",
  pages: "Page",
  countries: "Country",
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
const fmtDateLabel = (d: string) => {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const SearchConsole = () => {
  const { items: projects, fetch: fetchProjects } = useProjectsStore();

  const [connections, setConnections] = useState<GSCConnection[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [sites, setSites] = useState<GSCSite[]>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [days, setDays] = useState(28);
  const [view, setView] = useState<View>("overview");

  const [series, setSeries] = useState<GSCPerformanceResponse | null>(null);
  const [topQueries, setTopQueries] = useState<GSCQueryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [importProjectId, setImportProjectId] = useState("");
  const [importing, setImporting] = useState(false);

  const activeConn = useMemo(
    () => connections.find((c) => c.id === connectionId) ?? null,
    [connections, connectionId]
  );

  useEffect(() => {
    fetchProjects();
    loadConnections();
  }, [fetchProjects]);

  const loadConnections = async () => {
    setLoadingConns(true);
    try {
      const conns = await searchConsoleApi.listConnections();
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
      setSites([]);
      setSiteUrl("");
      return;
    }
    setError(null);
    searchConsoleApi
      .listSites(connectionId)
      .then((res) => {
        setSites(res.sites);
        setSiteUrl((prev) => prev || res.sites[0]?.site_url || "");
      })
      .catch((err) => setError(apiErrorMessage(err, "Failed to load sites")));
  }, [connectionId]);

  // Fetch data for the active data view whenever inputs change.
  useEffect(() => {
    if (view === "connections" || !connectionId || !siteUrl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (view === "overview") {
          const [ts, tq] = await Promise.all([
            searchConsoleApi.performance({ connection_id: connectionId, site_url: siteUrl, days, dimension: "date", row_limit: days + 10 }),
            searchConsoleApi.performance({ connection_id: connectionId, site_url: siteUrl, days, dimension: "query", row_limit: 10 }),
          ]);
          if (cancelled) return;
          ts.rows = [...ts.rows].sort((a, b) => a.key.localeCompare(b.key));
          setSeries(ts);
          setTopQueries(tq.rows);
        } else {
          const res = await searchConsoleApi.performance({
            connection_id: connectionId,
            site_url: siteUrl,
            days,
            dimension: DIMENSION[view],
            row_limit: 200,
          });
          if (cancelled) return;
          setSeries(res);
        }
      } catch (err) {
        if (!cancelled) setError(apiErrorMessage(err, "Failed to load data"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view, connectionId, siteUrl, days]);

  const handleConnect = async () => {
    setError(null);
    try {
      const redirect = `${window.location.origin}/oauth/google/search-console/callback`;
      const { auth_url } = await searchConsoleApi.getAuthUrl(redirect);
      window.location.href = auth_url;
    } catch (err) {
      setError(apiErrorMessage(err, "Could not start Google sign-in"));
    }
  };

  const handleDisconnect = async (id: number) => {
    try {
      await searchConsoleApi.disconnect(id);
      if (connectionId === id) setConnectionId(null);
      await loadConnections();
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to disconnect"));
    }
  };

  const handleImport = async () => {
    if (!connectionId || !siteUrl || !importProjectId) return;
    setImporting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await searchConsoleApi.importKeywords({
        project_id: Number(importProjectId),
        connection_id: connectionId,
        site_url: siteUrl,
        days,
        min_impressions: 10,
        limit: 500,
      });
      setNotice(`Imported ${res.imported} new and updated ${res.updated} keywords (skipped ${res.skipped}).`);
    } catch (err) {
      setError(apiErrorMessage(err, "Import failed"));
    } finally {
      setImporting(false);
    }
  };

  // --- Overview KPIs derived from the date series ---
  const kpis = useMemo(() => {
    const rows = series?.rows ?? [];
    const clicks = series?.total_clicks ?? 0;
    const impressions = series?.total_impressions ?? 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;
    const impSum = rows.reduce((a, r) => a + r.impressions, 0);
    const position = impSum > 0 ? rows.reduce((a, r) => a + r.position * r.impressions, 0) / impSum : 0;
    return { clicks, impressions, ctr, position };
  }, [series]);

  const renderControls = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Property (site)">
        <select value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} className={selectClass}>
          <option value="">Select a property…</option>
          {sites.map((s) => (
            <option key={s.site_url} value={s.site_url}>
              {s.site_url}
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
        {series && (
          <span>
            {series.start_date} → {series.end_date}
          </span>
        )}
      </div>
    </div>
  );

  const renderTable = (rows: GSCQueryRow[], colKey: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
          <tr>
            <th className="px-2 py-2">{COL_LABEL[colKey]}</th>
            <th className="px-2 py-2">Clicks</th>
            <th className="px-2 py-2">Impressions</th>
            <th className="px-2 py-2">CTR</th>
            <th className="px-2 py-2">Position</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              <td className="px-2 py-2 font-medium text-ink-dim">{r.key || "(not set)"}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtInt(r.clicks)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtInt(r.impressions)}</td>
              <td className="px-2 py-2 text-ink-dim">{fmtPct(r.ctr)}</td>
              <td className="px-2 py-2 text-ink-dim">{r.position.toFixed(1)}</td>
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
          No Search Console accounts connected yet. Connect one to get started.
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
            Connect a Search Console account to see data.{" "}
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

        {!loading && view === "overview" && series && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Clicks" value={fmtInt(kpis.clicks)} />
              <StatCard label="Impressions" value={fmtInt(kpis.impressions)} />
              <StatCard label="Avg CTR" value={fmtPct(kpis.ctr)} />
              <StatCard label="Avg position" value={kpis.position.toFixed(1)} />
            </div>
            <Card title="Clicks & impressions over time">
              <LineChart
                labels={series.rows.map((r) => fmtDateLabel(r.key))}
                series={[
                  { name: "Clicks", color: "#34d399", values: series.rows.map((r) => r.clicks) },
                  { name: "Impressions", color: "#60a5fa", values: series.rows.map((r) => r.impressions) },
                ]}
              />
            </Card>
            <Card title="Top queries">
              <BarChart
                data={topQueries.map((r) => ({ label: r.key, value: r.clicks }))}
                color="#34d399"
                limit={10}
              />
            </Card>
          </>
        )}

        {!loading && view === "queries" && series && (
          <Card
            title={`Top queries (${series.rows.length})`}
            action={
              <div className="flex items-end gap-2">
                <select
                  value={importProjectId}
                  onChange={(e) => setImportProjectId(e.target.value)}
                  className={`${selectClass} w-44`}
                >
                  <option value="">Import into project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Button variant="secondary" onClick={handleImport} disabled={importing || !importProjectId}>
                  {importing ? "Importing…" : "Import as keywords"}
                </Button>
              </div>
            }
          >
            {renderTable(series.rows, "queries")}
          </Card>
        )}

        {!loading && (view === "pages" || view === "countries" || view === "devices") && series && (
          <>
            {(view === "countries" || view === "devices") && (
              <Card title={`${COL_LABEL[view]} breakdown`}>
                <BarChart
                  data={series.rows.map((r) => ({ label: r.key, value: r.clicks }))}
                  color="#34d399"
                  limit={view === "devices" ? 5 : 12}
                />
              </Card>
            )}
            <Card title={`${COL_LABEL[view]} (${series.rows.length})`}>{renderTable(series.rows, view)}</Card>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Search Console</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Real Google Search performance — clicks, impressions, CTR and position — across queries,
          pages, countries and devices.
        </p>
      </div>

      {error && <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">{error}</div>}
      {notice && <div className="rounded-md bg-[rgba(0,135,90,0.1)] px-3 py-2 text-sm text-success">{notice}</div>}

      <div className="flex flex-col gap-6 lg:flex-row">
        <SubNav items={NAV} active={view} onSelect={(id) => setView(id as View)} title="Search Console" />
        <div className="min-w-0 flex-1">{renderActiveView()}</div>
      </div>
    </div>
  );
};

export default SearchConsole;
