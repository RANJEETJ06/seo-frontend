import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { seoApi, apiErrorMessage } from "../api";
import { useProjectsStore } from "../store/projects";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import { Field, Badge } from "../components/Field";
import type { SEOReport } from "../types";

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: projects, fetch: fetchProjects } = useProjectsStore();
  const [projectId, setProjectId] = useState<string>(
    searchParams.get("project") ?? ""
  );
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SEOReport | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!projectId) {
      setReports([]);
      return;
    }
    setLoading(true);
    setError(null);
    seoApi
      .listReports(Number(projectId))
      .then(setReports)
      .catch((err) => setError(apiErrorMessage(err, "Failed to load reports")))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleSelectProject = (id: string) => {
    setProjectId(id);
    setSelected(null);
    if (id) {
      setSearchParams({ project: id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reports</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Browse saved SEO reports per project.
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

      {loading && (
        <Card>
          <div className="py-8 text-center text-sm text-ink-faint">
            Loading reports…
          </div>
        </Card>
      )}

      {error && (
        <Card>
          <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
            {error}
          </div>
        </Card>
      )}

      {projectId && !loading && !error && reports.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <div className="text-sm font-medium text-ink-dim">
              No reports yet
            </div>
            <div className="mt-1 text-xs text-ink-faint">
              Run an analysis with this project selected to save a report.
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
      )}

      {reports.length > 0 && !selected && (
        <Card title={`Reports (${reports.length})`}>
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
      )}

      {selected && (
        <ReportDetail report={selected} onClose={() => setSelected(null)} />
      )}
    </div>
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
          <span>
            Created: {new Date(report.created_at).toLocaleString()}
          </span>
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
