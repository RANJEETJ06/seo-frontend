import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { seoApi, reportsApi, apiErrorMessage } from "../api";
import { useProjectsStore } from "../store/projects";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import { Field, Badge, Button, TextInput } from "../components/Field";
import type {
  SEOReport,
  GeneratedReport,
  GeneratedReportListItem,
} from "../types";

type Tab = "packaged" | "audits";

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: projects, fetch: fetchProjects } = useProjectsStore();
  const [projectId, setProjectId] = useState<string>(
    searchParams.get("project") ?? ""
  );
  const [tab, setTab] = useState<Tab>("packaged");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = (id: string) => {
    setProjectId(id);
    setSearchParams(id ? { project: id } : {});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reports</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Generate white-label client reports, or browse raw audit history.
        </p>
      </div>

      <Card>
        <div className="max-w-md">
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
        </div>
      </Card>

      {projectId && (
        <div className="inline-flex rounded-md border border-line-2 bg-panel p-1">
          {(
            [
              { id: "packaged", label: "Packaged reports" },
              { id: "audits", label: "Audit history" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded px-4 py-1.5 text-xs font-medium transition ${
                tab === t.id
                  ? "bg-signal text-[#1b1d22]"
                  : "text-ink-dim hover:bg-panel-2"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {projectId && tab === "packaged" && (
        <PackagedReports projectId={Number(projectId)} />
      )}
      {projectId && tab === "audits" && (
        <AuditHistory projectId={Number(projectId)} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Packaged (white-label) reports
// ---------------------------------------------------------------------------

const PackagedReports = ({ projectId }: { projectId: number }) => {
  const [items, setItems] = useState<GeneratedReportListItem[]>([]);
  const [selected, setSelected] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Branding inputs
  const [companyName, setCompanyName] = useState("");
  const [accent, setAccent] = useState("#4F46E5");
  const [footer, setFooter] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsApi.list(projectId);
      setItems(res.items);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load reports"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const report = await reportsApi.generate({
        project_id: projectId,
        branding: {
          company_name: companyName.trim() || undefined,
          accent_color: accent,
          footer_note: footer.trim() || undefined,
        },
      });
      setSelected(report);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Report generation failed"));
    } finally {
      setGenerating(false);
    }
  };

  const view = async (id: number) => {
    try {
      setSelected(await reportsApi.get(id));
    } catch (err) {
      setError(apiErrorMessage(err, "Could not open report"));
    }
  };

  const remove = async (id: number) => {
    await reportsApi.remove(id);
    if (selected?.id === id) setSelected(null);
    await load();
  };

  const downloadPdf = async (id: number) => {
    const blob = await reportsApi.downloadPdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-report-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card title="Generate a white-label report">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Company name (your agency)">
            <TextInput
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="BrightRank Agency"
            />
          </Field>
          <Field label="Accent color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 w-10 rounded border border-line-2 bg-panel"
              />
              <TextInput
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
              />
            </div>
          </Field>
          <Field label="Footer note (optional)">
            <TextInput
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="Confidential — prepared for the client."
            />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={generate} disabled={generating}>
            {generating ? "Generating…" : "Generate report"}
          </Button>
          <span className="text-xs text-ink-faint">
            Bundles the latest audit, top keywords, and rank trend (with drop
            reasons) into one shareable report + PDF.
          </span>
        </div>
        {error && (
          <div className="mt-3 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
      </Card>

      {selected && (
        <GeneratedReportView
          report={selected}
          onClose={() => setSelected(null)}
          onDownload={() => downloadPdf(selected.id)}
        />
      )}

      <Card title={`Saved reports${items.length ? ` (${items.length})` : ""}`}>
        {loading ? (
          <div className="py-6 text-center text-sm text-ink-faint">Loading…</div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-faint">
            No reports yet. Generate one above.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {items.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2"
              >
                <span className="font-medium text-ink-dim">{r.title}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-ink-faint">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => view(r.id)}
                    className="text-xs font-medium text-signal hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => downloadPdf(r.id)}
                    className="text-xs font-medium text-signal hover:underline"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="text-xs font-medium text-danger hover:underline"
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

const GeneratedReportView = ({
  report,
  onClose,
  onDownload,
}: {
  report: GeneratedReport;
  onClose: () => void;
  onDownload: () => void;
}) => {
  const p = report.payload;
  const audit = p.audit;
  const rank = p.rank;

  return (
    <Card
      title={report.title}
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={onDownload}
            className="text-xs font-medium text-signal hover:underline"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="text-xs font-medium text-ink-faint hover:text-ink-dim"
          >
            ← Close
          </button>
        </div>
      }
    >
      <div
        className="mb-4 rounded-md px-4 py-3 text-white"
        style={{ background: p.branding?.accent_color || "#4F46E5" }}
      >
        <div className="text-sm font-semibold">
          {p.branding?.company_name || "SEO Report"}
        </div>
        <div className="text-xs opacity-90">
          {p.project.name} · {p.project.domain} ·{" "}
          {new Date(p.generated_at).toLocaleDateString()}
        </div>
      </div>

      {audit ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <ScoreGauge score={audit.overall_score} label="Overall" size="lg" />
          <ScoreGauge score={audit.title_score} label="Title" />
          <ScoreGauge score={audit.meta_score} label="Meta" />
          <ScoreGauge score={audit.heading_score} label="Headings" />
          <ScoreGauge score={audit.content_score} label="Content" />
          <ScoreGauge score={audit.technical_score} label="Technical" />
        </div>
      ) : (
        <p className="text-sm text-ink-faint">
          No audit has been run for this project yet.
        </p>
      )}

      {audit?.ai_summary && (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">
          {audit.ai_summary}
        </p>
      )}

      {rank.tracked.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-ink">
            Keyword rankings
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-2 py-2">Query</th>
                  <th className="px-2 py-2">Position</th>
                  <th className="px-2 py-2">Change</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rank.tracked.slice(0, 15).map((it) => (
                  <tr key={it.query} className="border-t border-line">
                    <td className="max-w-xs truncate px-2 py-2 text-ink-dim">
                      {it.query}
                    </td>
                    <td className="px-2 py-2 text-ink">
                      #{it.current_position.toFixed(1)}
                    </td>
                    <td className="px-2 py-2">
                      {it.change == null ? (
                        <Badge tone="info">new</Badge>
                      ) : it.change > 0 ? (
                        <Badge tone="success">▲ {it.change.toFixed(1)}</Badge>
                      ) : it.change < 0 ? (
                        <Badge tone="danger">
                          ▼ {Math.abs(it.change).toFixed(1)}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">0</Badge>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <Badge
                        tone={
                          it.status === "declined"
                            ? "danger"
                            : it.status === "improved"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {it.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rank.declines.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-danger">
            Why rankings dropped
          </div>
          <div className="space-y-3">
            {rank.declines.slice(0, 8).map((d) => (
              <div key={d.query} className="rounded-md border border-line p-3">
                <div className="text-sm font-medium text-ink">{d.query}</div>
                <ul className="mt-1 space-y-1 text-xs text-ink-dim">
                  {d.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-danger">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {p.keywords.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-ink">Top keywords</div>
          <div className="flex flex-wrap gap-2">
            {p.keywords.map((k) => (
              <span
                key={k.term}
                className="rounded bg-panel-2 px-2 py-1 text-xs text-ink-dim"
              >
                {k.term} · {k.frequency.toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Audit history (existing per-URL SEO audits)
// ---------------------------------------------------------------------------

const AuditHistory = ({ projectId }: { projectId: number }) => {
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SEOReport | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelected(null);
    seoApi
      .listReports(projectId)
      .then(setReports)
      .catch((err) => setError(apiErrorMessage(err, "Failed to load reports")))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading)
    return (
      <Card>
        <div className="py-8 text-center text-sm text-ink-faint">
          Loading reports…
        </div>
      </Card>
    );

  if (error)
    return (
      <Card>
        <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
          {error}
        </div>
      </Card>
    );

  if (selected)
    return <ReportDetail report={selected} onClose={() => setSelected(null)} />;

  if (reports.length === 0)
    return (
      <Card>
        <div className="py-12 text-center">
          <div className="text-sm font-medium text-ink-dim">No audits yet</div>
          <div className="mt-1 text-xs text-ink-faint">
            Run an analysis with this project selected to save an audit.
          </div>
          <div className="mt-4">
            <Link
              to={`/analyze?project=${projectId}`}
              className="text-sm font-medium text-signal hover:underline"
            >
              Run analysis →
            </Link>
          </div>
        </div>
      </Card>
    );

  return (
    <Card title={`Audits (${reports.length})`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-2 py-2">URL</th>
              <th className="px-2 py-2">Score</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Created</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="max-w-md truncate px-2 py-2 font-medium text-ink-dim">
                  {r.url}
                </td>
                <td className="px-2 py-2">
                  <ScoreBadge score={r.overall_score} />
                </td>
                <td className="px-2 py-2">
                  <Badge tone={r.status === "done" ? "success" : "warn"}>
                    {r.status}
                  </Badge>
                </td>
                <td className="px-2 py-2 text-ink-dim">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    onClick={() => setSelected(r)}
                    className="text-xs font-medium text-signal hover:underline"
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const ScoreBadge = ({ score }: { score: number }) => {
  let tone: "success" | "warn" | "danger" = "danger";
  if (score >= 80) tone = "success";
  else if (score >= 50) tone = "warn";
  return <Badge tone={tone}>{Math.round(score)}</Badge>;
};

const ReportDetail = ({
  report,
  onClose,
}: {
  report: SEOReport;
  onClose: () => void;
}) => {
  const issues = Array.isArray(report.issues) ? (report.issues as string[]) : [];
  const recs = Array.isArray(report.recommendations)
    ? (report.recommendations as string[])
    : [];

  return (
    <div className="space-y-6">
      <Card
        title="Report detail"
        action={
          <button
            onClick={onClose}
            className="text-xs font-medium text-ink-faint hover:text-ink-dim"
          >
            ← Back to list
          </button>
        }
      >
        <div className="mb-4 break-all text-sm font-medium text-ink">
          {report.url}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <ScoreGauge score={report.overall_score} label="Overall" size="lg" />
          <ScoreGauge score={report.title_score} label="Title" />
          <ScoreGauge score={report.meta_score} label="Meta" />
          <ScoreGauge score={report.heading_score} label="Headings" />
          <ScoreGauge score={report.content_score} label="Content" />
          <ScoreGauge score={report.technical_score} label="Technical" />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink-faint">
          <span>Created: {new Date(report.created_at).toLocaleString()}</span>
          {report.completed_at && (
            <span>
              Completed: {new Date(report.completed_at).toLocaleString()}
            </span>
          )}
        </div>
      </Card>

      {report.ai_summary && (
        <Card title="AI summary">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">
            {report.ai_summary}
          </p>
        </Card>
      )}

      {(issues.length > 0 || recs.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {issues.length > 0 && (
            <Card title={`Issues (${issues.length})`}>
              <ul className="space-y-1 text-sm text-danger">
                {issues.map((it, i) => (
                  <li key={i}>• {it}</li>
                ))}
              </ul>
            </Card>
          )}
          {recs.length > 0 && (
            <Card title={`Recommendations (${recs.length})`}>
              <ul className="space-y-2 text-sm text-ink-dim">
                {recs.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-success">→</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
