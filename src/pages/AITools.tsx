import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { aiApi, apiErrorMessage } from "../api";
import Card from "../components/Card";
import {
  Field,
  TextInput,
  TextArea,
  Button,
  Badge,
} from "../components/Field";
import OutreachDashboard from "../components/outreach/OutreachDashboard";
import TemplatesPanel from "../components/outreach/TemplatesPanel";
import CampaignsPanel from "../components/outreach/CampaignsPanel";
import type {
  AIRecommendationResponse,
  BacklinkAgentResponse,
  BrokenLinkScanResponse,
  DirectoryQueueResponse,
  GuestPostResponse,
  InternalExportResponse,
  QueueListResponse,
  RAGResponse,
} from "../types";

type Tab = "recommend" | "backlinks" | "builder" | "rag" | "outreach";

const AITools = () => {
  const [tab, setTab] = useState<Tab>("recommend");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">AI Tools</h1>
        <p className="mt-1 text-sm text-ink-faint">
          AI-generated recommendations and a retrieval-augmented assistant
          grounded in your ingested pages.
        </p>
      </div>

      <div className="inline-flex rounded-md border border-line-2 bg-panel p-1">
        {(
          [
            { id: "recommend", label: "Recommendations" },
            { id: "backlinks", label: "Backlink Agent" },
            { id: "builder", label: "Link Builder" },
            { id: "outreach", label: "Outreach" },
            { id: "rag", label: "RAG Assistant" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded px-4 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-signal text-[#363a41]"
                : "text-ink-dim hover:bg-panel-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "recommend" && <RecommendPanel />}
      {tab === "backlinks" && <BacklinkPanel />}
      {tab === "builder" && <LinkBuilderPanel />}
      {tab === "outreach" && <OutreachHub />}
      {tab === "rag" && <RagPanel />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Outreach Hub — sub-tabs for dashboard, templates, campaigns
// ---------------------------------------------------------------------------

type OutreachTab = "dashboard" | "templates" | "campaigns";

const OutreachHub = () => {
  const [tab, setTab] = useState<OutreachTab>("dashboard");
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border border-line-2 bg-panel p-1">
        {(
          [
            { id: "dashboard", label: "Dashboard" },
            { id: "campaigns", label: "Campaigns" },
            { id: "templates", label: "Templates" },
          ] as { id: OutreachTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded px-3 py-1 text-xs font-medium transition ${
              tab === t.id
                ? "bg-signal text-white"
                : "text-ink-dim hover:bg-panel-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "dashboard" && <OutreachDashboard />}
      {tab === "campaigns" && <CampaignsPanel />}
      {tab === "templates" && <TemplatesPanel />}
    </div>
  );
};

const RecommendPanel = () => {
  const [mode, setMode] = useState<"url" | "content">("url");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIRecommendationResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiApi.recommend({
        url: mode === "url" ? url.trim() || undefined : undefined,
        content: mode === "content" ? content : undefined,
        focus_keyword: focusKeyword.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not generate recommendations"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Generate recommendations">
        <div className="mb-4 inline-flex rounded-md border border-line-2 p-1">
          {(["url", "content"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                mode === m
                  ? "bg-signal text-[#35383e]"
                  : "text-ink-dim hover:bg-panel-2"
              }`}
            >
              {m === "url" ? "From URL" : "From content"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {mode === "url" ? (
            <div className="md:col-span-2">
              <Field label="URL">
                <TextInput
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                />
              </Field>
            </div>
          ) : (
            <div className="md:col-span-2">
              <Field label="Content">
                <TextArea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the page content to optimize…"
                />
              </Field>
            </div>
          )}
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="seo optimization"
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Generating…" : "Get recommendations"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Summary">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">
                {result.summary}
              </p>
            </Card>
            <Card
              title={`Recommendations (${result.recommendations.length})`}
            >
              <ul className="space-y-2 text-sm text-ink-dim">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-success">→</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card title="Score estimate">
            <div className="flex h-full items-center justify-center">
              {result.score_estimate !== null &&
              result.score_estimate !== undefined ? (
                <div className="text-center">
                  <div className="text-5xl font-semibold text-signal">
                    {Math.round(result.score_estimate)}
                  </div>
                  <div className="mt-1 text-xs text-ink-faint">
                    out of 100
                  </div>
                </div>
              ) : (
                <div className="text-sm text-ink-faint">Not available</div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const BacklinkPanel = () => {
  const [targetUrl, setTargetUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [internalPages, setInternalPages] = useState("");
  const [prospectUrls, setProspectUrls] = useState("");
  const [crawlInternal, setCrawlInternal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacklinkAgentResponse | null>(null);

  const splitUrls = (raw: string) =>
    raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiApi.backlinks({
        target_url: targetUrl.trim(),
        focus_keyword: focusKeyword.trim() || undefined,
        internal_pages: splitUrls(internalPages),
        prospect_urls: splitUrls(prospectUrls),
        crawl_internal: crawlInternal,
      });
      setResult(res);
    } catch (err) {
      setError(apiErrorMessage(err, "Backlink agent failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Build links to a page">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Target URL"
              hint="The page you want to build backlinks to."
            >
              <TextInput
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/guide"
              />
            </Field>
          </div>
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="seo optimization"
            />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-ink-dim">
            <input
              type="checkbox"
              checked={crawlInternal}
              onChange={(e) => setCrawlInternal(e.target.checked)}
              className="h-4 w-4 rounded border-line-2 text-signal focus:ring-signal/30"
            />
            Auto-crawl site for internal pages
          </label>
          <Field
            label="Internal pages (optional)"
            hint="One URL per line or comma-separated. Mined for internal backlinks."
          >
            <TextArea
              rows={4}
              value={internalPages}
              onChange={(e) => setInternalPages(e.target.value)}
              placeholder={"https://example.com/blog/post-a\nhttps://example.com/blog/post-b"}
            />
          </Field>
          <Field
            label="Prospect URLs (optional)"
            hint="External pages to evaluate + draft outreach for."
          >
            <TextArea
              rows={4}
              value={prospectUrls}
              onChange={(e) => setProspectUrls(e.target.value)}
              placeholder={"https://blog.other.com/resources\nhttps://news.site.com/links"}
            />
          </Field>
          <div className="flex items-end md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Analyzing…" : "Run backlink agent"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card title="Summary">
            <div className="flex items-start justify-between gap-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">
                {result.summary}
              </p>
              <Badge tone={result.ai_enabled ? "success" : "neutral"}>
                {result.ai_enabled ? "AI on" : "Heuristic"}
              </Badge>
            </div>
          </Card>

          <Card
            title={`Internal backlink suggestions (${result.internal_link_suggestions.length})`}
          >
            {result.internal_link_suggestions.length === 0 ? (
              <p className="text-sm text-ink-faint">
                No internal link opportunities found.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {result.internal_link_suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-line p-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-medium text-ink">
                        Anchor: “{s.anchor_text}”
                      </span>
                      <Badge tone="info">
                        {Math.round(s.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="text-xs text-ink-faint">
                      Add a link on{" "}
                      <span className="break-all text-ink-dim">
                        {s.source_url}
                      </span>{" "}
                      → {s.target_url}
                    </div>
                    <p className="mt-2 rounded bg-panel-2 p-2 text-xs italic text-ink-dim">
                      …{s.context}…
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">{s.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`External prospects (${result.prospects.length})`}>
            {result.prospects.length === 0 ? (
              <p className="text-sm text-ink-faint">
                No prospect URLs were provided.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {result.prospects.map((p, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-line p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-all font-medium text-ink">
                        {p.url}
                      </span>
                      <Badge
                        tone={
                          p.relevance_score >= 40
                            ? "success"
                            : p.relevance_score >= 15
                            ? "warn"
                            : "neutral"
                        }
                      >
                        {p.relevance_score}% relevant
                      </Badge>
                      {p.already_links && (
                        <Badge tone="info">already links</Badge>
                      )}
                      {p.has_resource_section && (
                        <Badge tone="neutral">resource section</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">
                      {p.rationale}
                    </p>
                    {p.shared_topics.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.shared_topics.map((t, j) => (
                          <span
                            key={j}
                            className="rounded bg-panel-2 px-1.5 py-0.5 text-[11px] text-ink-dim"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.outreach_email && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-signal">
                          Outreach email
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap rounded bg-panel-2 p-3 text-xs leading-relaxed text-ink-dim">
                          {p.outreach_email}
                        </pre>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

interface IngestEntry {
  url: string;
  chunks: number;
  ingestedAt: string;
}

const RagPanel = () => {
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [ingested, setIngested] = useState<IngestEntry[]>([]);

  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(4);
  const [projectId, setProjectId] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<RAGResponse | null>(null);

  const handleIngest = async (e: FormEvent) => {
    e.preventDefault();
    setIngesting(true);
    setIngestError(null);
    try {
      const res = await aiApi.ragIngest(ingestUrl.trim());
      setIngested([
        {
          url: res.url,
          chunks: res.chunks,
          ingestedAt: new Date().toLocaleTimeString(),
        },
        ...ingested,
      ]);
      setIngestUrl("");
    } catch (err) {
      setIngestError(apiErrorMessage(err, "Ingest failed"));
    } finally {
      setIngesting(false);
    }
  };

  const handleAsk = async (e: FormEvent) => {
    e.preventDefault();
    setAsking(true);
    setAskError(null);
    setAnswer(null);
    try {
      const res = await aiApi.ragAsk({
        question: question.trim(),
        top_k: topK,
        project_id: projectId ? Number(projectId) : undefined,
      });
      setAnswer(res);
    } catch (err) {
      setAskError(apiErrorMessage(err, "Query failed"));
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="1. Ingest a page">
        <form onSubmit={handleIngest} className="space-y-4">
          <Field label="URL">
            <TextInput
              type="url"
              required
              value={ingestUrl}
              onChange={(e) => setIngestUrl(e.target.value)}
              placeholder="https://docs.example.com/page"
            />
          </Field>
          <Button type="submit" disabled={ingesting}>
            {ingesting ? "Ingesting…" : "Ingest"}
          </Button>
          {ingestError && (
            <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {ingestError}
            </div>
          )}
        </form>

        {ingested.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 text-xs font-medium text-ink-dim">
              Recently ingested (this session)
            </div>
            <ul className="space-y-2 text-sm">
              {ingested.map((it, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2"
                >
                  <span className="truncate text-ink-dim">{it.url}</span>
                  <Badge tone="info">{it.chunks} chunks</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card title="2. Ask a question">
        <form onSubmit={handleAsk} className="space-y-4">
          <Field label="Question">
            <TextArea
              rows={3}
              required
              minLength={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What does the page say about pricing?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Top K">
              <TextInput
                type="number"
                min={1}
                max={20}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
              />
            </Field>
            <Field label="Project ID (optional)">
              <TextInput
                type="number"
                min={1}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="—"
              />
            </Field>
          </div>
          <Button type="submit" disabled={asking}>
            {asking ? "Asking…" : "Ask"}
          </Button>
          {askError && (
            <div className="rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {askError}
            </div>
          )}
        </form>

        {answer && (
          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1 text-xs font-medium text-ink-dim">
                Answer
              </div>
              <p className="whitespace-pre-wrap rounded-md bg-panel-2 p-3 text-sm leading-relaxed text-ink">
                {answer.answer}
              </p>
            </div>
            {answer.sources.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-medium text-ink-dim">
                  Sources ({answer.sources.length})
                </div>
                <ul className="space-y-1 text-xs">
                  {answer.sources.map((s, i) => (
                    <li
                      key={i}
                      className="truncate rounded border border-line px-2 py-1 text-ink-dim"
                    >
                      {(s.url as string | undefined) ??
                        JSON.stringify(s).slice(0, 200)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Link Builder: human-in-the-loop automation. Everything here discovers,
// generates, and queues/exports — nothing is auto-posted or auto-sent.
// ---------------------------------------------------------------------------
type BuilderTab =
  | "internal"
  | "discover"
  | "broken"
  | "guest"
  | "directories"
  | "queue";

const splitUrls = (raw: string) =>
  raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

const GuardrailNote = ({ text }: { text: string }) => (
  <div className="rounded-md border border-amber-200 bg-[rgba(245,196,81,0.1)] px-3 py-2 text-xs leading-relaxed text-amber-800">
    <span className="font-semibold">Safe by design: </span>
    {text}
  </div>
);

const LinkBuilderPanel = () => {
  const [sub, setSub] = useState<BuilderTab>("internal");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-md border border-line-2 bg-panel p-1">
        {(
          [
            { id: "internal", label: "Internal export" },
            { id: "discover", label: "Discover prospects" },
            { id: "broken", label: "Broken links" },
            { id: "guest", label: "Guest post" },
            { id: "directories", label: "Directories" },
            { id: "queue", label: "Queue" },
          ] as { id: BuilderTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              sub === t.id
                ? "bg-signal text-[#2f3239]"
                : "text-ink-dim hover:bg-panel-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {sub === "internal" && <InternalExportTab />}
      {sub === "discover" && <DiscoverTab />}
      {sub === "broken" && <BrokenLinksTab />}
      {sub === "guest" && <GuestPostTab />}
      {sub === "directories" && <DirectoriesTab />}
      {sub === "queue" && <QueueTab />}
    </div>
  );
};

const InternalExportTab = () => {
  const [targetUrl, setTargetUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [internalPages, setInternalPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InternalExportResponse | null>(null);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await aiApi.internalExport({
          target_url: targetUrl.trim(),
          focus_keyword: focusKeyword.trim() || undefined,
          internal_pages: splitUrls(internalPages),
          crawl_internal: true,
        })
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Internal export failed"));
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!result) return;
    const blob = new Blob([result.csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "internal-link-patches.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <Card title="Export internal-link patches">
        <form onSubmit={run} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Target URL" hint="The page links should point to.">
              <TextInput
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/guide"
              />
            </Field>
          </div>
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
            />
          </Field>
          <Field
            label="Internal pages (optional)"
            hint="Blank = auto-crawl the site."
          >
            <TextArea
              rows={3}
              value={internalPages}
              onChange={(e) => setInternalPages(e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Generating…" : "Generate patches"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <Card
          title={`Patches (${result.patches.length})`}
          action={
            result.patches.length > 0 ? (
              <button
                onClick={downloadCsv}
                className="text-xs font-medium text-signal hover:underline"
              >
                Download CSV
              </button>
            ) : undefined
          }
        >
          <GuardrailNote text={result.guardrails} />
          {result.patches.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">
              No exact-match anchor opportunities found.
            </p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {result.patches.map((p, i) => (
                <li key={i} className="rounded-md border border-line p-3">
                  <div className="break-all text-xs text-ink-faint">
                    {p.source_url} → <b>{p.anchor_text}</b>
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded bg-bg-soft p-3 text-[11px] leading-relaxed text-ink">
                    {p.diff || p.patched_snippet}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};

const DiscoverTab = () => {
  const [targetUrl, setTargetUrl] = useState("");
  const [seedUrls, setSeedUrls] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacklinkAgentResponse | null>(null);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await aiApi.discoverProspects({
          target_url: targetUrl.trim(),
          seed_urls: splitUrls(seedUrls),
          focus_keyword: focusKeyword.trim() || undefined,
          persist: true,
        })
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Discovery failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Discover & queue outreach prospects">
        <form onSubmit={run} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Target URL">
              <TextInput
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
            />
          </Field>
          <Field
            label="Seed / competitor pages"
            hint="Expanded one hop along their outbound links."
          >
            <TextArea
              rows={3}
              value={seedUrls}
              onChange={(e) => setSeedUrls(e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Discovering…" : "Discover prospects"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <Card title={`Queued prospects (${result.prospects.length})`}>
          <p className="mb-3 text-sm text-ink-dim">{result.summary}</p>
          <ul className="space-y-3 text-sm">
            {result.prospects.map((p, i) => (
              <li key={i} className="rounded-md border border-line p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-all font-medium text-ink">
                    {p.url}
                  </span>
                  <Badge tone={p.relevance_score >= 25 ? "success" : "neutral"}>
                    {p.relevance_score}% relevant
                  </Badge>
                </div>
                {p.outreach_email && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-signal">
                      Drafted email (review before sending)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded bg-panel-2 p-3 text-xs text-ink-dim">
                      {p.outreach_email}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

const BrokenLinksTab = () => {
  const [targetUrl, setTargetUrl] = useState("");
  const [resourceUrls, setResourceUrls] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BrokenLinkScanResponse | null>(null);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await aiApi.brokenLinks({
          target_url: targetUrl.trim(),
          resource_urls: splitUrls(resourceUrls),
          focus_keyword: focusKeyword.trim() || undefined,
          persist: true,
        })
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Broken-link scan failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Find broken-link opportunities">
        <form onSubmit={run} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Target URL" hint="Your page = the replacement.">
              <TextInput
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
            />
          </Field>
          <Field
            label="Resource pages to scan"
            hint="Their dead outbound links are checked."
          >
            <TextArea
              rows={3}
              value={resourceUrls}
              onChange={(e) => setResourceUrls(e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Scanning…" : "Scan for broken links"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <Card title={`Opportunities (${result.opportunities.length})`}>
          <GuardrailNote text={result.guardrails} />
          <p className="my-3 text-sm text-ink-dim">{result.summary}</p>
          <ul className="space-y-3 text-sm">
            {result.opportunities.map((o, i) => (
              <li key={i} className="rounded-md border border-line p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="warn">HTTP {o.http_status}</Badge>
                  <Badge
                    tone={o.relevance_score >= 25 ? "success" : "neutral"}
                  >
                    {o.relevance_score}% relevant
                  </Badge>
                </div>
                <p className="mt-1 break-all text-xs text-ink-faint">
                  On <b>{o.resource_url}</b> → dead link {o.broken_url}
                </p>
                {o.outreach_email && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-signal">
                      Drafted email (review before sending)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded bg-panel-2 p-3 text-xs text-ink-dim">
                      {o.outreach_email}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

const GuestPostTab = () => {
  const [targetUrl, setTargetUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [hostBlog, setHostBlog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuestPostResponse | null>(null);

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await aiApi.guestPost({
          target_url: targetUrl.trim(),
          focus_keyword: focusKeyword.trim() || undefined,
          host_blog_url: hostBlog.trim() || undefined,
          persist: true,
        })
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Guest-post draft failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Draft a guest-post article">
        <form onSubmit={run} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Target URL"
              hint="The single contextual link goes in the author bio."
            >
              <TextInput
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Focus keyword (optional)">
            <TextInput
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
            />
          </Field>
          <Field label="Host blog URL (optional)">
            <TextInput
              value={hostBlog}
              onChange={(e) => setHostBlog(e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Writing…" : "Generate draft"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <Card
          title={result.title}
          action={
            <Badge tone={result.ai_generated ? "success" : "neutral"}>
              {result.ai_generated ? "AI draft" : "Template"} ·{" "}
              {result.word_count} words
            </Badge>
          }
        >
          <GuardrailNote text={result.guardrails} />
          <pre className="mt-3 max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded bg-panel-2 p-4 text-xs leading-relaxed text-ink-dim">
            {result.markdown}
          </pre>
        </Card>
      )}
    </div>
  );
};

const DirectoriesTab = () => {
  const [form, setForm] = useState({
    name: "",
    website: "",
    description: "",
    category: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DirectoryQueueResponse | null>(null);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await aiApi.directories({
          profile: {
            name: form.name.trim(),
            website: form.website.trim(),
            description: form.description.trim(),
            category: form.category.trim() || undefined,
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            address: form.address.trim() || undefined,
          },
          persist: true,
        })
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Directory prefill failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Pre-fill directory submissions">
        <form onSubmit={run} className="grid gap-4 md:grid-cols-2">
          <Field label="Business name">
            <TextInput required value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Website">
            <TextInput
              type="url"
              required
              value={form.website}
              onChange={set("website")}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <TextArea
                rows={2}
                value={form.description}
                onChange={set("description")}
              />
            </Field>
          </div>
          <Field label="Category">
            <TextInput value={form.category} onChange={set("category")} />
          </Field>
          <Field label="Email">
            <TextInput value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Phone">
            <TextInput value={form.phone} onChange={set("phone")} />
          </Field>
          <Field label="Address">
            <TextInput value={form.address} onChange={set("address")} />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Preparing…" : "Build submission queue"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <Card title={`Ready to submit (${result.items.length})`}>
          <GuardrailNote text={result.guardrails} />
          <ul className="mt-3 space-y-3 text-sm">
            {result.items.map((it, i) => (
              <li key={i} className="rounded-md border border-line p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink">
                    {it.directory_name}
                  </span>
                  <a
                    href={it.submit_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-signal hover:underline"
                  >
                    Open submit page →
                  </a>
                </div>
                <p className="mt-1 text-xs text-ink-faint">{it.notes}</p>
                <pre className="mt-2 whitespace-pre-wrap rounded bg-panel-2 p-3 text-xs text-ink-dim">
                  {JSON.stringify(it.payload, null, 2)}
                </pre>
                {it.missing_fields.length > 0 && (
                  <p className="mt-1 text-[11px] text-warn">
                    Missing: {it.missing_fields.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

const QueueTab = () => {
  const [kind, setKind] = useState<"outreach" | "directory" | "guestpost">(
    "outreach"
  );
  const [scope, setScope] = useState<
    "review" | "all" | "approved" | "queued" | "drafted" | "discovered" | "sent" | "replied" | "skipped"
  >("review");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QueueListResponse | null>(null);

  const load = async (
    k: typeof kind,
    s: typeof scope = scope
  ) => {
    setLoading(true);
    setError(null);
    try {
      setData(await aiApi.queueList(k, s === "all" ? undefined : s));
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load queue"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(kind, scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, scope]);

  const advance = async (id: number, status: string) => {
    try {
      await aiApi.queueUpdate(kind, id, status);
      await load(kind);
    } catch (err) {
      setError(apiErrorMessage(err, "Update failed"));
    }
  };

  return (
    <Card
      title={scope === "review" ? "Backlink approval queue" : "Backlink queue"}
      action={
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: "review", label: "Needs review" },
              { id: "all", label: "All" },
              { id: "approved", label: "Approved" },
              { id: "queued", label: "Queued" },
              { id: "drafted", label: "Drafted" },
              { id: "discovered", label: "Discovered" },
              { id: "sent", label: "Sent" },
              { id: "replied", label: "Replied" },
              { id: "skipped", label: "Skipped" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                scope === s.id
                  ? "bg-signal text-[#0a0b0d]"
                  : "text-ink-dim hover:bg-panel-2"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {(["outreach", "directory", "guestpost"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                kind === k
                  ? "bg-signal text-[#0a0b0d]"
                  : "text-ink-dim hover:bg-panel-2"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(kind, scope)}
          className="text-xs font-medium text-signal hover:underline"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {error && (
        <div className="mt-2 rounded-md bg-[rgba(251,113,133,0.1)] px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      {data && (
        <ul className="mt-3 space-y-2 text-sm">
          {data.items.length === 0 && (
            <li className="text-ink-faint">Queue is empty.</li>
          )}
          {data.items.map((row, i) => {
            const id = Number(row.id);
            return (
              <li
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line p-3"
              >
                <span className="break-all text-xs text-ink-dim">
                  #{id}{" "}
                  {String(
                    row.prospect_url ||
                      row.directory_name ||
                      row.title ||
                      ""
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone="info">{String(row.status)}</Badge>
                  {String(row.status) !== "approved" && (
                    <button
                      type="button"
                      onClick={() => advance(id, "approved")}
                      className="rounded border border-emerald-200 px-2 py-1 text-xs text-success hover:bg-[rgba(74,222,128,0.1)]"
                    >
                      Approve
                    </button>
                  )}
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      e.target.value && advance(id, e.target.value)
                    }
                    className="rounded border border-line-2 px-1.5 py-1 text-xs"
                  >
                    <option value="">set status…</option>
                    <option value="approved">approved</option>
                    {["queued", "sent", "replied", "skipped"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default AITools;
