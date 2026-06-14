import { useState } from "react";
import type { FormEvent } from "react";
import { seoApi, apiErrorMessage } from "../api";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import { Field, TextInput, Button, Badge } from "../components/Field";
import type {
  AIVisibilityResult,
  GEOSignal,
  SnippetOpportunity,
} from "../types";

/**
 * AI Visibility page — GEO citation readiness + AEO snippet targeting +
 * People Also Ask. Designed to make the abstract scores actionable: every
 * weak signal turns into a recommendation, every snippet block lists what
 * to change to win it.
 */
const AIVisibility = () => {
  const [url, setUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [useAi, setUseAi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIVisibilityResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await seoApi.aiVisibility({
        url: url.trim(),
        focus_keyword: focusKeyword.trim() || undefined,
        use_ai: useAi,
        max_paa: 8,
      });
      setResult(r);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not run AI Visibility audit"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          AI Visibility (GEO + AEO)
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          How citable is the page by ChatGPT and Perplexity (GEO) and how well
          does it target featured snippets / People Also Ask (AEO)?
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Field label="URL to analyze">
              <TextInput
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                disabled={loading}
              />
            </Field>
          </div>
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="content marketing"
              disabled={loading}
            />
          </Field>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="use-ai"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              disabled={loading}
              className="rounded border-line-2 text-signal focus:ring-signal"
            />
            <label htmlFor="use-ai" className="text-sm text-ink-dim">
              Use Gemini to enrich PAA questions & draft answers (no-op if no
              key)
            </label>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </form>
        {error && (
          <div className="mt-4 rounded-md border border-rose-200 bg-[rgba(251,113,133,0.1)] p-3 text-sm text-danger">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <>
          {/* Score gauges */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Combined">
              <div className="flex justify-center">
                <ScoreGauge
                  score={result.combined_score}
                  label="AI Visibility"
                  size="lg"
                />
              </div>
            </Card>
            <Card title="GEO">
              <div className="flex justify-center">
                <ScoreGauge
                  score={result.geo_score}
                  label="AI-citation readiness"
                  size="lg"
                />
              </div>
            </Card>
            <Card title="AEO">
              <div className="flex justify-center">
                <ScoreGauge
                  score={result.aeo_score}
                  label="Snippet targeting"
                  size="lg"
                />
              </div>
            </Card>
          </div>

          {/* Summary chips */}
          <Card>
            <div className="flex flex-wrap gap-3 text-sm">
              <Stat label="Claims" value={result.claim_count} />
              <Stat label="Statistics" value={result.statistic_count} />
              <Stat label="Source links" value={result.source_links} />
              <Stat label="Definitions" value={result.quotable_definitions.length} />
              <Stat label="Question headings" value={result.question_headings.length} />
              <Stat label="Snippet blocks" value={result.snippet_opportunities.length} />
              <div className="ml-auto flex items-center gap-2">
                <Badge tone={result.ai_enabled ? "success" : "neutral"}>
                  {result.ai_enabled ? "Gemini enriched" : "Heuristic only"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* GEO signals */}
          <Card title="GEO Signals — AI Citation Readiness">
            <div className="space-y-3">
              {result.geo_signals.map((s) => (
                <SignalRow key={s.name} signal={s} />
              ))}
            </div>
          </Card>

          {/* Snippet opportunities */}
          {result.snippet_opportunities.length > 0 && (
            <Card title={`Snippet Opportunities (${result.snippet_opportunities.length})`}>
              <p className="mb-3 text-xs text-ink-faint">
                Ranked by snippet-win likelihood. Each row shows the answer
                block under one of your headings and what would improve it.
              </p>
              <div className="space-y-3">
                {result.snippet_opportunities.map((o, i) => (
                  <SnippetRow key={i} opp={o} />
                ))}
              </div>
            </Card>
          )}

          {/* Quotable definitions */}
          {result.quotable_definitions.length > 0 && (
            <Card title={`Quotable Definitions (${result.quotable_definitions.length})`}>
              <ul className="space-y-2 text-sm text-ink-dim">
                {result.quotable_definitions.map((d, i) => (
                  <li key={i} className="rounded-md border border-emerald-100 bg-[rgba(74,222,128,0.1)] p-3">
                    <span className="text-success">“</span>
                    {d}
                    <span className="text-success">”</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* PAA */}
          {(result.paa_questions.length > 0 || result.paa_with_answers.length > 0) && (
            <Card title="People Also Ask">
              {result.paa_with_answers.length > 0 ? (
                <div className="space-y-3">
                  {result.paa_with_answers.map((qa, i) => (
                    <details
                      key={i}
                      className="group rounded-md border border-line-2 p-3 open:bg-panel-2"
                    >
                      <summary className="cursor-pointer list-none text-sm font-medium text-ink group-open:text-signal">
                        <span className="mr-2 text-ink-faint group-open:text-signal">›</span>
                        {qa.question}
                      </summary>
                      <p className="mt-2 pl-4 text-sm text-ink-dim">{qa.answer}</p>
                    </details>
                  ))}
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {result.paa_questions.map((q, i) => (
                    <li key={i} className="flex gap-2 text-ink-dim">
                      <span className="text-signal">?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              )}
              {result.paa_questions.length > 0 && (
                <div className="mt-4 border-t border-line pt-3 text-right">
                  <button
                    onClick={() => {
                      const text = (result.paa_with_answers.length > 0
                        ? result.paa_with_answers.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
                        : result.paa_questions
                      ).join("\n\n");
                      navigator.clipboard.writeText(text);
                      alert("Copied PAA to clipboard!");
                    }}
                    className="text-xs text-signal hover:text-signal"
                  >
                    Copy all
                  </button>
                </div>
              )}
            </Card>
          )}

          {/* Recommendations */}
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

          {/* Notes */}
          {result.notes.length > 0 && (
            <Card title="Notes">
              <ul className="space-y-1 text-xs text-ink-dim">
                {result.notes.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ink-faint">•</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

// -------- subcomponents --------

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2 rounded-md border border-line-2 bg-panel-2 px-3 py-1.5">
    <span className="text-xs text-ink-faint">{label}</span>
    <span className="text-sm font-semibold text-ink">{value}</span>
  </div>
);

const SignalRow = ({ signal }: { signal: GEOSignal }) => {
  const tone =
    signal.score >= 80 ? "success" : signal.score >= 50 ? "warn" : "danger";
  const barColor =
    signal.score >= 80
      ? "bg-[rgba(74,222,128,0.1)]0"
      : signal.score >= 50
        ? "bg-[rgba(245,196,81,0.1)]0"
        : "bg-[rgba(251,113,133,0.1)]0";
  return (
    <div className="rounded-md border border-line-2 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{signal.label}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{signal.detail}</p>
        </div>
        <Badge tone={tone}>{signal.score.toFixed(0)}</Badge>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, signal.score))}%` }}
        />
      </div>
    </div>
  );
};

const SnippetRow = ({ opp }: { opp: SnippetOpportunity }) => {
  const tone =
    opp.snippet_score >= 80
      ? "success"
      : opp.snippet_score >= 50
        ? "warn"
        : "danger";
  const typeBadge: Record<string, "info" | "success" | "warn" | "neutral"> = {
    paragraph: "info",
    list: "success",
    table: "success",
    definition: "info",
  };
  return (
    <div className="rounded-md border border-line-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink">
              {opp.heading}
            </span>
            <Badge tone={typeBadge[opp.block_type] ?? "neutral"}>
              {opp.block_type}
            </Badge>
            <span className="text-xs text-ink-faint">
              {opp.word_count} words
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-ink-dim">
            {opp.text_preview}
          </p>
          <p className="mt-1 text-xs italic text-ink-faint">
            {opp.rationale}
          </p>
          {opp.suggestions.length > 0 && (
            <ul className="mt-2 space-y-1">
              {opp.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-signal">
                  <span>→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Badge tone={tone}>{opp.snippet_score.toFixed(0)}</Badge>
      </div>
    </div>
  );
};

export default AIVisibility;
