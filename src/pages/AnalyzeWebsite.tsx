import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { seoApi, apiErrorMessage } from "../api";
import { useProjectsStore } from "../store/projects";
import { useTaskPolling } from "../hooks/useTaskPolling";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import { Field, TextInput, Button, Badge } from "../components/Field";
import type { SEOAnalysisResult } from "../types";

const AnalyzeWebsite = () => {
  const [searchParams] = useSearchParams();
  const { items: projects, fetch: fetchProjects } = useProjectsStore();

  const [url, setUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [projectId, setProjectId] = useState<string>(
    searchParams.get("project") ?? ""
  );
  const [deep, setDeep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const poll = useTaskPolling<SEOAnalysisResult>({ intervalMs: 2000 });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    poll.reset();
    try {
      const { task_id } = await seoApi.submitAnalysis({
        url: url.trim(),
        focus_keyword: focusKeyword.trim() || undefined,
        project_id: projectId ? Number(projectId) : undefined,
        deep,
      });
      poll.start(task_id);
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "Could not enqueue analysis"));
    } finally {
      setSubmitting(false);
    }
  };

  const result = poll.result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          Analyze Website
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Submit a URL and a background worker will crawl, score, and generate
          AI recommendations.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="URL to analyze">
              <TextInput
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={poll.loading}
              />
            </Field>
          </div>
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="seo optimization"
              disabled={poll.loading}
            />
          </Field>
          <Field label="Save to project (optional)">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={poll.loading}
              className="w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 disabled:opacity-60"
            >
              <option value="">— Don't save —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.domain})
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink-dim">
              <input
                type="checkbox"
                checked={deep}
                onChange={(e) => setDeep(e.target.checked)}
                disabled={poll.loading}
                className="rounded border-line-2 text-signal focus:ring-signal"
              />
              Deep analysis (crawls additional pages)
            </label>
            <div className="flex gap-2">
              {poll.loading && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => poll.cancel()}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={submitting || poll.loading}>
                {submitting
                  ? "Submitting…"
                  : poll.loading
                    ? "Analyzing…"
                    : "Run analysis"}
              </Button>
            </div>
          </div>
          {submitError && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {submitError}
            </div>
          )}
        </form>
      </Card>

      {poll.taskId && (poll.loading || poll.error) && (
        <TaskProgressCard
          status={poll.status}
          progress={poll.progress}
          error={poll.error}
          taskId={poll.taskId}
        />
      )}

      {result && <AnalysisResultView result={result} />}
    </div>
  );
};

const TaskProgressCard = ({
  status,
  progress,
  error,
  taskId,
}: {
  status: string | null;
  progress: { stage?: string; [key: string]: unknown } | null;
  error: string | null;
  taskId: string;
}) => {
  if (error) {
    return (
      <Card title="Analysis failed">
        <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
          {error}
        </div>
        <div className="mt-2 text-xs text-ink-faint">Task ID: {taskId}</div>
      </Card>
    );
  }

  const stage = (progress?.stage as string | undefined) ?? null;
  return (
    <Card
      title="Analysis in progress"
      action={<Badge tone="info">{status ?? "PENDING"}</Badge>}
    >
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-signal border-t-transparent" />
        <div className="text-sm text-ink-dim">
          {stage
            ? `Stage: ${stage}…`
            : status === "PENDING"
              ? "Waiting for worker to pick up the task…"
              : "Working…"}
        </div>
      </div>
      <div className="mt-2 text-xs text-ink-faint">Task ID: {taskId}</div>
    </Card>
  );
};

const AnalysisResultView = ({ result }: { result: SEOAnalysisResult }) => {
  return (
    <div className="space-y-6">
      <Card title="Scores">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <ScoreGauge score={result.overall_score} label="Overall" size="lg" />
          <ScoreGauge score={result.title_score} label="Title" />
          <ScoreGauge score={result.meta_score} label="Meta" />
          <ScoreGauge score={result.heading_score} label="Headings" />
          <ScoreGauge score={result.content_score} label="Content" />
          <ScoreGauge score={result.technical_score} label="Technical" />
        </div>
      </Card>

      {result.ai_summary && (
        <Card title="AI summary">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">
            {result.ai_summary}
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Meta tags">
          <dl className="space-y-3 text-sm">
            <Row label="Title" value={result.meta.title} />
            <Row
              label="Title length"
              value={`${result.meta.title_length} chars`}
            />
            <Row label="Description" value={result.meta.meta_description} />
            <Row
              label="Description length"
              value={`${result.meta.description_length} chars`}
            />
            <Row label="Canonical" value={result.meta.canonical} />
            <Row label="Robots" value={result.meta.robots} />
          </dl>
          {result.meta.issues.length > 0 && (
            <div className="mt-4 space-y-1">
              <div className="text-xs font-medium text-ink-dim">Issues</div>
              <IssueList items={result.meta.issues} />
            </div>
          )}
        </Card>

        <Card title="Headings">
          <dl className="space-y-3 text-sm">
            <Row label="H1 count" value={result.headings.h1_count} />
            <Row label="H2 count" value={result.headings.h2.length} />
            <Row label="H3 count" value={result.headings.h3.length} />
          </dl>
          {result.headings.h1.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium text-ink-dim">H1 tags</div>
              <ul className="mt-1 space-y-1 text-sm text-ink-dim">
                {result.headings.h1.map((h, i) => (
                  <li key={i} className="truncate">• {h}</li>
                ))}
              </ul>
            </div>
          )}
          {result.headings.issues.length > 0 && (
            <div className="mt-4 space-y-1">
              <div className="text-xs font-medium text-ink-dim">Issues</div>
              <IssueList items={result.headings.issues} />
            </div>
          )}
        </Card>

        <Card title="Technical">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <TechItem label="HTTPS" ok={result.technical.https} />
            <TechItem
              label="Mobile viewport"
              ok={result.technical.mobile_viewport}
            />
            <TechItem
              label="Robots.txt"
              ok={result.technical.has_robots_txt}
            />
            <TechItem label="Sitemap" ok={result.technical.has_sitemap} />
            <TechItem
              label="Canonical"
              ok={result.technical.has_canonical}
            />
            <TechItem
              label="Structured data"
              ok={result.technical.structured_data}
            />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row
              label="Page size"
              value={`${result.technical.page_size_kb.toFixed(1)} KB`}
            />
            <Row
              label="Response time"
              value={`${result.technical.response_time_ms.toFixed(0)} ms`}
            />
            <Row label="Word count" value={result.word_count} />
          </dl>
        </Card>

        <Card title="Images & links">
          <dl className="space-y-2 text-sm">
            <Row label="Total images" value={result.images.total} />
            <Row label="Missing alt" value={result.images.missing_alt} />
            <Row label="Internal links" value={result.links.internal} />
            <Row label="External links" value={result.links.external} />
            <Row label="Nofollow" value={result.links.nofollow} />
            <Row label="Broken" value={result.links.broken_count} />
          </dl>
        </Card>
      </div>

      {result.keywords.length > 0 && (
        <Card title="Top keywords">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-2 py-2">Term</th>
                  <th className="px-2 py-2">Frequency</th>
                  <th className="px-2 py-2">Density</th>
                </tr>
              </thead>
              <tbody>
                {result.keywords.slice(0, 20).map((k, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-2 py-2 font-medium text-ink-dim">
                      {k.term}
                    </td>
                    <td className="px-2 py-2 text-ink-dim">{k.frequency}</td>
                    <td className="px-2 py-2 text-ink-dim">
                      {(k.density * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(result.issues.length > 0 || result.recommendations.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {result.issues.length > 0 && (
            <Card title={`Issues (${result.issues.length})`}>
              <IssueList items={result.issues} tone="danger" />
            </Card>
          )}
          {result.recommendations.length > 0 && (
            <Card title={`Recommendations (${result.recommendations.length})`}>
              <ul className="space-y-2 text-sm text-ink-dim">
                {result.recommendations.map((r, i) => (
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

const Row = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="flex items-start justify-between gap-3">
    <dt className="shrink-0 text-xs font-medium text-ink-faint">{label}</dt>
    <dd className="truncate text-right text-ink">
      {value === null || value === undefined || value === "" ? (
        <span className="text-ink-faint">—</span>
      ) : (
        value
      )}
    </dd>
  </div>
);

const TechItem = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center justify-between rounded-md border border-line px-3 py-2">
    <span className="text-ink-dim">{label}</span>
    <Badge tone={ok ? "success" : "danger"}>{ok ? "Yes" : "No"}</Badge>
  </div>
);

const IssueList = ({
  items,
  tone = "warn",
}: {
  items: string[];
  tone?: "warn" | "danger";
}) => (
  <ul className="space-y-1 text-sm">
    {items.map((it, i) => (
      <li
        key={i}
        className={`flex gap-2 ${tone === "danger" ? "text-danger" : "text-warn"}`}
      >
        <span>•</span>
        <span>{it}</span>
      </li>
    ))}
  </ul>
);

export default AnalyzeWebsite;
