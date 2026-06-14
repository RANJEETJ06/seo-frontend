import { useState } from "react";
import type { FormEvent } from "react";
import { seoApi, apiErrorMessage } from "../api";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import { Field, TextInput, Button, Badge } from "../components/Field";
import type { TechAuditResponse, WebVitalsMetric, SchemaBlock } from "../types";

const TechAudit = () => {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TechAuditResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await seoApi.techAudit({
        url: url.trim(),
        strategy,
      });
      setResult(response);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not audit URL"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          Technical Audit
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Analyze Core Web Vitals (performance metrics) and structured data
          (schema.org) to understand how search engines and AI systems parse
          your site.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Field label="URL to audit">
              <TextInput
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
              />
            </Field>
          </div>
          <div>
            <Field label="Strategy">
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as "mobile" | "desktop")}
                disabled={loading}
                className="w-full rounded-md border border-line-2 bg-panel px-3 py-2 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 disabled:opacity-60"
              >
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </Field>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Auditing..." : "Audit"}
            </Button>
          </div>
        </form>
        {error && (
          <div className="mt-4 rounded-md border border-rose-200 bg-[rgba(251,113,133,0.1)] p-3 text-sm text-danger">
            {error}
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Overall Score">
              <div className="flex justify-center">
                <ScoreGauge
                  score={result.combined_score}
                  label="Combined"
                  size="lg"
                />
              </div>
            </Card>
            <Card title="Performance">
              <div className="flex justify-center">
                <ScoreGauge
                  score={result.web_vitals.performance_score}
                  label={result.web_vitals.source === "psi" ? "PSI Score" : "Estimate"}
                  size="lg"
                />
              </div>
            </Card>
            <Card title="Structured Data">
              <div className="flex justify-center">
                <ScoreGauge
                  score={result.schema_audit.score}
                  label="Schema Score"
                  size="lg"
                />
              </div>
            </Card>
          </div>

          <Card>
            <p className="text-sm text-ink-dim">{result.summary}</p>
          </Card>

          {/* Core Web Vitals */}
          <Card title="Core Web Vitals">
            {result.web_vitals.metrics.length === 0 ? (
              <p className="text-sm text-ink-faint">No metrics available.</p>
            ) : (
              <div className="space-y-3">
                {result.web_vitals.metrics.map((m) => (
                  <MetricRow key={m.key} metric={m} />
                ))}
              </div>
            )}
            {result.web_vitals.notes.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="mb-2 text-xs font-medium text-ink-dim">Notes:</p>
                <ul className="space-y-1 text-xs text-ink-dim">
                  {result.web_vitals.notes.map((n, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-ink-faint">•</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Web Vitals Opportunities */}
          {result.web_vitals.opportunities.length > 0 && (
            <Card title={`Performance Opportunities (${result.web_vitals.opportunities.length})`}>
              <ul className="space-y-2 text-sm">
                {result.web_vitals.opportunities.map((opp, i) => (
                  <li key={i} className="flex gap-2 text-warn">
                    <span>⚡</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Structured Data Overview */}
          <Card title="Structured Data (Schema.org)">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-dim">JSON-LD blocks:</span>
                <Badge tone={result.schema_audit.jsonld_blocks > 0 ? "success" : "warn"}>
                  {result.schema_audit.jsonld_blocks}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-dim">Detected types:</span>
                <span className="font-medium text-ink">
                  {result.schema_audit.detected_types.length === 0
                    ? "None"
                    : result.schema_audit.detected_types.join(", ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-dim">Microdata:</span>
                <Badge tone={result.schema_audit.microdata_detected ? "success" : "neutral"}>
                  {result.schema_audit.microdata_detected ? "Detected" : "None"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* JSON-LD Blocks Detail */}
          {result.schema_audit.blocks.length > 0 && (
            <Card title={`JSON-LD Blocks (${result.schema_audit.blocks.length})`}>
              <div className="space-y-4">
                {result.schema_audit.blocks.map((block, idx) => (
                  <BlockDetail key={idx} block={block} index={idx + 1} />
                ))}
              </div>
            </Card>
          )}

          {/* Schema Errors */}
          {result.schema_audit.errors.length > 0 && (
            <Card title={`Schema Errors (${result.schema_audit.errors.length})`}>
              <ul className="space-y-1 text-sm">
                {result.schema_audit.errors.map((e, i) => (
                  <li key={i} className="flex gap-2 text-danger">
                    <span>✕</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Schema Warnings */}
          {result.schema_audit.warnings.length > 0 && (
            <Card title={`Schema Warnings (${result.schema_audit.warnings.length})`}>
              <ul className="space-y-1 text-sm">
                {result.schema_audit.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2 text-warn">
                    <span>⚠</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Schema Recommendations */}
          {result.schema_audit.recommendations.length > 0 && (
            <Card title={`Schema Recommendations (${result.schema_audit.recommendations.length})`}>
              <ul className="space-y-2 text-sm">
                {result.schema_audit.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-signal">
                    <span>→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Generated JSON-LD Snippet */}
          {result.schema_audit.generated_jsonld && (
            <Card
              title={`Ready-to-use: ${result.schema_audit.generated_for} Schema`}
              action={
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.schema_audit.generated_jsonld || "");
                    alert("Copied to clipboard!");
                  }}
                  className="text-xs text-signal hover:text-signal"
                >
                  Copy
                </button>
              }
            >
              <p className="mb-3 text-xs text-ink-dim">
                Paste this into the `&lt;head&gt;` of your page. Replace TODO fields with your actual data.
              </p>
              <pre className="overflow-x-auto rounded-md bg-bg-soft p-3 text-xs text-ink-dim">
                {result.schema_audit.generated_jsonld}
              </pre>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

const MetricRow = ({ metric }: { metric: WebVitalsMetric }) => {
  const bgColor = {
    good: "bg-[rgba(74,222,128,0.1)]",
    "needs-improvement": "bg-[rgba(245,196,81,0.1)]",
    poor: "bg-[rgba(251,113,133,0.1)]",
    unknown: "bg-panel-2",
  }[metric.rating] || "bg-panel-2";

  const textColor = {
    good: "text-success",
    "needs-improvement": "text-warn",
    poor: "text-danger",
    unknown: "text-ink-dim",
  }[metric.rating] || "text-ink-dim";

  return (
    <div className={`rounded-md border p-3 ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor}`}>{metric.label}</p>
          <p className="mt-1 text-xs text-ink-dim">{metric.key}</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${textColor}`}>{metric.display}</p>
          <Badge tone={metric.rating === "good" ? "success" : metric.rating === "poor" ? "danger" : "warn"}>
            {metric.rating}
          </Badge>
        </div>
      </div>
      {metric.good_max !== undefined && metric.poor_min !== undefined && (
        <div className="mt-2 text-xs text-ink-dim">
          <p>
            Good: ≤{metric.good_max} {metric.unit} | Poor: ≥{metric.poor_min} {metric.unit}
          </p>
        </div>
      )}
    </div>
  );
};

const BlockDetail = ({ block, index }: { block: SchemaBlock; index: number }) => {
  return (
    <div className="rounded-md border border-line-2 p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Block #{index}</p>
          {block.types.length > 0 && (
            <p className="mt-1 text-xs text-ink-dim">
              Types: {block.types.join(", ")}
            </p>
          )}
        </div>
        <Badge tone={block.valid_json ? "success" : "danger"}>
          {block.valid_json ? "Valid JSON" : "Invalid JSON"}
        </Badge>
      </div>
      {block.errors.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-danger">
          {block.errors.map((e, i) => (
            <li key={i}>✕ {e}</li>
          ))}
        </ul>
      )}
      {block.warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-warn">
          {block.warnings.map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TechAudit;
