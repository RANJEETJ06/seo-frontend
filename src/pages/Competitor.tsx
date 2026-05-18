import { useState } from "react";
import type { FormEvent } from "react";
import { seoApi, apiErrorMessage } from "../api";
import { useTaskPolling } from "../hooks/useTaskPolling";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import { Field, TextInput, Button, Badge } from "../components/Field";
import type { CompetitorReport, SEOAnalysisResult } from "../types";

const Competitor = () => {
  const [targetUrl, setTargetUrl] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [focusKeyword, setFocusKeyword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poll = useTaskPolling<CompetitorReport>({ intervalMs: 3000 });

  const updateCompetitor = (idx: number, value: string) => {
    setCompetitors(competitors.map((c, i) => (i === idx ? value : c)));
  };

  const addCompetitor = () => {
    if (competitors.length < 10) setCompetitors([...competitors, ""]);
  };

  const removeCompetitor = (idx: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== idx));
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = competitors.map((c) => c.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setError("Add at least one competitor URL.");
      return;
    }
    setSubmitting(true);
    setError(null);
    poll.reset();
    try {
      const { task_id } = await seoApi.submitCompetitor({
        target_url: targetUrl.trim(),
        competitor_urls: cleaned,
        focus_keyword: focusKeyword.trim() || undefined,
      });
      poll.start(task_id);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not enqueue competitor analysis"));
    } finally {
      setSubmitting(false);
    }
  };

  const report = poll.result;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Competitor Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare your page against up to 10 competitors and discover gaps.
        </p>
      </div>

      <Card>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Your URL">
              <TextInput
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://your-site.com/page"
              />
            </Field>
            <Field label="Focus keyword (optional)">
              <TextInput
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="seo optimization"
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Competitor URLs ({competitors.length}/10)
              </span>
              <button
                type="button"
                onClick={addCompetitor}
                disabled={competitors.length >= 10}
                className="text-xs font-medium text-indigo-600 hover:underline disabled:opacity-40"
              >
                + Add another
              </button>
            </div>
            <div className="space-y-2">
              {competitors.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput
                    type="url"
                    value={c}
                    onChange={(e) => updateCompetitor(i, e.target.value)}
                    placeholder={`https://competitor-${i + 1}.com`}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeCompetitor(i)}
                    disabled={competitors.length === 1}
                    className="rounded-md px-3 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
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
                  : "Run comparison"}
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </form>
      </Card>

      {poll.taskId && (poll.loading || poll.error) && (
        <Card
          title={poll.error ? "Analysis failed" : "Comparison in progress"}
          action={!poll.error ? <Badge tone="info">{poll.status}</Badge> : null}
        >
          {poll.error ? (
            <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {poll.error}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <div className="text-sm text-slate-600">
                {(poll.progress?.stage as string | undefined) ??
                  "Waiting for worker…"}
              </div>
            </div>
          )}
          <div className="mt-2 text-xs text-slate-400">
            Task ID: {poll.taskId}
          </div>
        </Card>
      )}

      {report && <ReportView report={report} />}
    </div>
  );
};

const ReportView = ({ report }: { report: CompetitorReport }) => {
  const allRows: { label: string; site: SEOAnalysisResult; isTarget: boolean }[] = [
    { label: "Your page", site: report.target, isTarget: true },
    ...report.competitors.map((c) => ({
      label: c.url,
      site: c,
      isTarget: false,
    })),
  ];

  return (
    <div className="space-y-6">
      <Card title="Comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Site</th>
                <th className="px-2 py-2">Overall</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Meta</th>
                <th className="px-2 py-2">Headings</th>
                <th className="px-2 py-2">Content</th>
                <th className="px-2 py-2">Technical</th>
                <th className="px-2 py-2">Words</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((r, i) => (
                <tr
                  key={i}
                  className={`border-t border-slate-100 ${
                    r.isTarget ? "bg-indigo-50/40" : ""
                  }`}
                >
                  <td className="max-w-xs truncate px-2 py-2">
                    <div className="flex items-center gap-2">
                      {r.isTarget && <Badge tone="info">You</Badge>}
                      <span className="truncate font-medium text-slate-700">
                        {r.label}
                      </span>
                    </div>
                  </td>
                  <Cell value={r.site.overall_score} bold />
                  <Cell value={r.site.title_score} />
                  <Cell value={r.site.meta_score} />
                  <Cell value={r.site.heading_score} />
                  <Cell value={r.site.content_score} />
                  <Cell value={r.site.technical_score} />
                  <td className="px-2 py-2 text-slate-600">
                    {r.site.word_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Your scores">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <ScoreGauge
            score={report.target.overall_score}
            label="Overall"
            size="lg"
          />
          <ScoreGauge score={report.target.title_score} label="Title" />
          <ScoreGauge score={report.target.meta_score} label="Meta" />
          <ScoreGauge score={report.target.heading_score} label="Headings" />
          <ScoreGauge score={report.target.content_score} label="Content" />
          <ScoreGauge
            score={report.target.technical_score}
            label="Technical"
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {report.gaps.length > 0 && (
          <Card title={`Gaps (${report.gaps.length})`}>
            <ul className="space-y-2 text-sm text-rose-700">
              {report.gaps.map((g, i) => (
                <li key={i} className="flex gap-2">
                  <span>⚠</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {report.opportunities.length > 0 && (
          <Card title={`Opportunities (${report.opportunities.length})`}>
            <ul className="space-y-2 text-sm text-emerald-700">
              {report.opportunities.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span>→</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

const Cell = ({ value, bold }: { value: number; bold?: boolean }) => {
  let tone = "text-rose-600";
  if (value >= 80) tone = "text-emerald-600";
  else if (value >= 60) tone = "text-amber-600";
  else if (value >= 40) tone = "text-orange-600";
  return (
    <td className={`px-2 py-2 ${tone} ${bold ? "font-semibold" : ""}`}>
      {Math.round(value)}
    </td>
  );
};

export default Competitor;
