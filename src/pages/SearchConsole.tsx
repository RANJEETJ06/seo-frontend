import { useEffect, useMemo, useState } from "react";
import { searchConsoleApi, apiErrorMessage } from "../api";
import { useProjectsStore } from "../store/projects";
import Card from "../components/Card";
import { Field, Button, Badge } from "../components/Field";
import type {
  GSCConnection,
  GSCQueryRow,
  GSCSite,
} from "../types";

const DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 28 days", days: 28 },
  { label: "Last 3 months", days: 90 },
];

const selectClass =
  "w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20";

const SearchConsole = () => {
  const { items: projects, fetch: fetchProjects } = useProjectsStore();

  const [connections, setConnections] = useState<GSCConnection[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [connectionId, setConnectionId] = useState<number | null>(null);

  const [sites, setSites] = useState<GSCSite[]>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [days, setDays] = useState(28);

  const [rows, setRows] = useState<GSCQueryRow[]>([]);
  const [totals, setTotals] = useState<{ clicks: number; impressions: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [importProjectId, setImportProjectId] = useState("");
  const [importing, setImporting] = useState(false);

  const activeConn = useMemo(
    () => connections.find((c) => c.id === connectionId) ?? null,
    [connections, connectionId]
  );

  // --- Load connections + projects on mount ---
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

  // --- Load sites whenever the active connection changes ---
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

  const handleLoadPerformance = async () => {
    if (!connectionId || !siteUrl) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await searchConsoleApi.performance({
        connection_id: connectionId,
        site_url: siteUrl,
        days,
        row_limit: 200,
      });
      setRows(res.rows);
      setTotals({ clicks: res.total_clicks, impressions: res.total_impressions });
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load performance"));
    } finally {
      setLoading(false);
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
      setNotice(
        `Imported ${res.imported} new and updated ${res.updated} keywords (skipped ${res.skipped}).`
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Import failed"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Search Console</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Connect Google Search Console to see the real queries your sites rank
          for — clicks, impressions, CTR and position — and import them as
          keywords.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-md bg-[rgba(0,135,90,0.1)] px-3 py-2 text-sm text-success">
          {notice}
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
                <button
                  className="flex-1 text-left"
                  onClick={() => setConnectionId(c.id)}
                >
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

      {/* Site + range controls */}
      {activeConn && (
        <Card title="Search performance">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Property (site)">
              <select
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className={selectClass}
              >
                <option value="">Select a property…</option>
                {sites.map((s) => (
                  <option key={s.site_url} value={s.site_url}>
                    {s.site_url}
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
              <Button
                onClick={handleLoadPerformance}
                disabled={loading || !siteUrl}
                className="w-full"
              >
                {loading ? "Loading…" : "Load queries"}
              </Button>
            </div>
          </div>

          {totals && (
            <div className="mt-4 flex gap-6 border-t border-line pt-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-faint">Total clicks</div>
                <div className="text-lg font-semibold text-ink">
                  {Math.round(totals.clicks).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-faint">Total impressions</div>
                <div className="text-lg font-semibold text-ink">
                  {Math.round(totals.impressions).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Query table + import */}
      {rows.length > 0 && (
        <Card
          title={`Top queries (${rows.length})`}
          action={
            <div className="flex items-end gap-2">
              <select
                value={importProjectId}
                onChange={(e) => setImportProjectId(e.target.value)}
                className={`${selectClass} w-48`}
              >
                <option value="">Import into project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                onClick={handleImport}
                disabled={importing || !importProjectId}
              >
                {importing ? "Importing…" : "Import as keywords"}
              </Button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-2 py-2">Query</th>
                  <th className="px-2 py-2">Clicks</th>
                  <th className="px-2 py-2">Impressions</th>
                  <th className="px-2 py-2">CTR</th>
                  <th className="px-2 py-2">Position</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-2 py-2 font-medium text-ink-dim">{r.key}</td>
                    <td className="px-2 py-2 text-ink-dim">{Math.round(r.clicks)}</td>
                    <td className="px-2 py-2 text-ink-dim">{Math.round(r.impressions)}</td>
                    <td className="px-2 py-2 text-ink-dim">{(r.ctr * 100).toFixed(1)}%</td>
                    <td className="px-2 py-2 text-ink-dim">{r.position.toFixed(1)}</td>
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

export default SearchConsole;
