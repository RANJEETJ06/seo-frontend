import { Link } from "react-router-dom";
import Card from "../components/Card";
import { Badge } from "../components/Field";

/**
 * Plain-English primer on SEO / GEO / AEO and a guided tour of where each
 * concept maps to a feature in this platform. Designed as the first stop
 * for a new user — no jargon assumed.
 */
const Learn = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          Learn: SEO, GEO & AEO
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          A quick primer on the three optimisation disciplines this platform
          covers, and a step-by-step path to your first audit.
        </p>
      </div>

      {/* Hero comparison */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ConceptCard
          badge="SEO"
          tone="info"
          title="Search Engine Optimization"
          subtitle="Rank on the blue links."
          who="Google, Bing — classic results page."
          how="Crawlable HTML, titles & meta, headings, fast Core Web Vitals, backlinks, internal linking, no broken pages."
          win="A user types a query → your page appears in the top 10."
        />
        <ConceptCard
          badge="AEO"
          tone="success"
          title="Answer Engine Optimization"
          subtitle="Win the answer box."
          who="Featured snippets, People Also Ask, voice assistants (Siri, Alexa)."
          how="Question-form headings, concise 40–60 word answers, FAQ / HowTo schema, lists & tables, definitions up front."
          win="A user asks a question → your answer is read out or surfaced above the results."
        />
        <ConceptCard
          badge="GEO"
          tone="warn"
          title="Generative Engine Optimization"
          subtitle="Get cited by AI."
          who="ChatGPT, Perplexity, Claude, Google AI Overviews, Gemini."
          how="Clear factual claims with sources, entity clarity, structured data, llms.txt, content LLMs can extract & attribute."
          win="A user asks an AI → it quotes you and links to your site."
        />
      </div>

      {/* Why all three? */}
      <Card title="Why care about all three?">
        <div className="space-y-3 text-sm text-ink-dim">
          <p>
            Five years ago SEO was the only game. Today, an increasing share of
            search traffic never reaches a results page — it ends inside an AI
            answer or a snippet. If you only optimise for ranked links, you lose
            visibility on every query that gets answered before the user clicks.
          </p>
          <p>
            The three disciplines overlap heavily (clean HTML, good structure,
            and schema markup help all three) but they each have their own
            tactics. This platform gives you tooling for each layer.
          </p>
        </div>
      </Card>

      {/* Side-by-side comparison */}
      <Card title="At a glance">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line-2 text-xs uppercase text-ink-faint">
              <tr>
                <th className="px-3 py-2">Aspect</th>
                <th className="px-3 py-2">SEO</th>
                <th className="px-3 py-2">AEO</th>
                <th className="px-3 py-2">GEO</th>
              </tr>
            </thead>
            <tbody className="text-ink-dim">
              <CompareRow
                aspect="Target surface"
                seo="Organic results"
                aeo="Snippets, PAA, voice"
                geo="AI chat answers"
              />
              <CompareRow
                aspect="Primary signals"
                seo="Backlinks, content, CWV"
                aeo="Schema, Q-format, brevity"
                geo="Citations, entities, llms.txt"
              />
              <CompareRow
                aspect="Content style"
                seo="Comprehensive articles"
                aeo="Direct, structured answers"
                geo="Verifiable facts + sources"
              />
              <CompareRow
                aspect="Click outcome"
                seo="User clicks through"
                aeo="Often zero-click"
                geo="Cited as source link"
              />
              <CompareRow
                aspect="Measured by"
                seo="Rank, organic traffic"
                aeo="Snippet wins, voice hits"
                geo="AI citations, referrals"
              />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick start */}
      <Card title="Quick start — your first 15 minutes">
        <ol className="space-y-4 text-sm">
          <Step
            n={1}
            title="Create a project"
            body="Projects group reports and keywords per site. Open Dashboard, click 'New Project', enter the domain you want to optimise."
            link={{ to: "/", label: "Go to Dashboard" }}
          />
          <Step
            n={2}
            title="Run a full SEO analysis"
            body="The Analyze page crawls a URL, scores titles/meta/headings/content/links/technical, and produces AI recommendations. This is your SEO baseline."
            link={{ to: "/analyze", label: "Analyze a URL" }}
          />
          <Step
            n={3}
            title="Run a Technical Audit"
            body="The Technical Audit measures Core Web Vitals (performance) and structured-data coverage (the foundation of AEO + GEO). It even generates ready-to-paste JSON-LD for the schema your page is missing."
            link={{ to: "/tech-audit", label: "Run Technical Audit" }}
          />
          <Step
            n={4}
            title="Extract & cluster keywords"
            body="From any URL or pasted text, pull the strongest keywords and cluster them into themes. Use clusters to plan FAQ-style content (AEO) and topic hubs (SEO)."
            link={{ to: "/keywords", label: "Open Keywords" }}
          />
          <Step
            n={5}
            title="Check competitors"
            body="Side-by-side audit of your URL vs up to 10 competitors. Surfaces gaps (what they cover that you don't) and opportunities."
            link={{ to: "/competitor", label: "Open Competitor" }}
          />
          <Step
            n={6}
            title="Build backlinks (human-in-the-loop)"
            body="AI Tools generates internal-link suggestions, drafts guest-post outlines, pre-fills directory submissions, and finds broken-link opportunities. Nothing auto-posts — every action is queued for you to review."
            link={{ to: "/ai-tools", label: "Open AI Tools" }}
          />
        </ol>
      </Card>

      {/* Feature → discipline map */}
      <Card title="Which feature helps which discipline?">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureColumn
            label="SEO"
            tone="info"
            items={[
              { name: "Analyze Website", to: "/analyze" },
              { name: "Crawler", to: "/crawler" },
              { name: "Reports", to: "/reports" },
              { name: "Competitor", to: "/competitor" },
              { name: "Backlink agent", to: "/ai-tools" },
              { name: "Keywords", to: "/keywords" },
            ]}
          />
          <FeatureColumn
            label="AEO"
            tone="success"
            items={[
              { name: "AI Visibility (snippet score)", to: "/ai-visibility" },
              { name: "People Also Ask generator", to: "/ai-visibility" },
              { name: "Technical Audit (Schema)", to: "/tech-audit" },
              { name: "FAQ JSON-LD generator", to: "/tech-audit" },
              { name: "Keyword clusters → FAQ", to: "/keywords" },
            ]}
          />
          <FeatureColumn
            label="GEO"
            tone="warn"
            items={[
              { name: "AI Visibility (citation score)", to: "/ai-visibility" },
              { name: "Quotable definitions detector", to: "/ai-visibility" },
              { name: "Schema coverage audit", to: "/tech-audit" },
              { name: "Organization/Article JSON-LD", to: "/tech-audit" },
              { name: "RAG ingest (knowledge base)", to: "/ai-tools" },
            ]}
          />
        </div>
      </Card>

      {/* FAQ */}
      <Card title="Frequently asked">
        <div className="space-y-4 text-sm">
          <FAQ
            q="Do I need a Gemini or PageSpeed API key?"
            a="No. Every analyser falls back to deterministic heuristics when no key is configured. Setting GEMINI_API_KEY unlocks richer AI recommendations and summaries; setting PAGESPEED_API_KEY upgrades the Technical Audit from heuristic estimates to real PageSpeed Insights data."
          />
          <FAQ
            q="Does the backlink builder auto-post links?"
            a="No, and it never will. Every outreach email, directory submission, and internal-link patch is queued for you to review and apply manually. This is a deliberate, hard-coded design choice — see the backlink guardrails in the codebase."
          />
          <FAQ
            q="Where do AEO and GEO actually live in this app?"
            a="In the Technical Audit page. The schema auditor recommends FAQPage (AEO) when it detects question-style headings, recommends Organization/Article (GEO) for entity clarity, and generates ready-to-paste JSON-LD for whichever your page needs most."
          />
          <FAQ
            q="What is JSON-LD and why does the audit keep mentioning it?"
            a="JSON-LD is a JSON snippet you put in your page's <head> that tells search engines and AI systems what your content is (an article, a product, a list of FAQs…). It's the single highest-leverage upgrade for both AEO and GEO — and the audit will generate it for you."
          />
        </div>
      </Card>

      {/* CTA */}
      <div className="rounded-lg border border-[rgba(202,249,76,0.25)] bg-gradient-to-br from-signal-soft to-white p-6">
        <h3 className="text-lg font-semibold text-ink">Ready to start?</h3>
        <p className="mt-1 text-sm text-ink-dim">
          Run your first audit now — it takes under a minute and works with no API keys.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center rounded-md bg-signal px-4 py-2 text-sm font-medium text-[#0a0b0d] hover:bg-signal-press"
          >
            Analyze a URL →
          </Link>
          <Link
            to="/tech-audit"
            className="inline-flex items-center rounded-md border border-line-2 bg-panel px-4 py-2 text-sm font-medium text-ink-dim hover:bg-white/[0.04]"
          >
            Run Technical Audit →
          </Link>
        </div>
      </div>
    </div>
  );
};

// ---------- pieces ----------

type Tone = "info" | "success" | "warn";

const ConceptCard = ({
  badge,
  tone,
  title,
  subtitle,
  who,
  how,
  win,
}: {
  badge: string;
  tone: Tone;
  title: string;
  subtitle: string;
  who: string;
  how: string;
  win: string;
}) => (
  <div className="flex flex-col rounded-lg border border-line-2 bg-panel p-5 shadow-sm">
    <div className="flex items-center gap-2">
      <Badge tone={tone}>{badge}</Badge>
      <span className="text-xs text-ink-faint">{subtitle}</span>
    </div>
    <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
    <dl className="mt-3 space-y-2 text-sm">
      <div>
        <dt className="text-xs font-medium text-ink-faint">Where</dt>
        <dd className="text-ink-dim">{who}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium text-ink-faint">How you win</dt>
        <dd className="text-ink-dim">{how}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium text-ink-faint">The outcome</dt>
        <dd className="text-ink-dim">{win}</dd>
      </div>
    </dl>
  </div>
);

const CompareRow = ({
  aspect,
  seo,
  aeo,
  geo,
}: {
  aspect: string;
  seo: string;
  aeo: string;
  geo: string;
}) => (
  <tr className="border-b border-line last:border-0">
    <td className="px-3 py-2 font-medium text-ink-dim">{aspect}</td>
    <td className="px-3 py-2">{seo}</td>
    <td className="px-3 py-2">{aeo}</td>
    <td className="px-3 py-2">{geo}</td>
  </tr>
);

const Step = ({
  n,
  title,
  body,
  link,
}: {
  n: number;
  title: string;
  body: string;
  link: { to: string; label: string };
}) => (
  <li className="flex gap-4">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal-soft text-xs font-semibold text-signal">
      {n}
    </span>
    <div className="flex-1">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-ink-dim">{body}</p>
      <Link
        to={link.to}
        className="mt-1 inline-block text-xs font-medium text-signal hover:text-signal"
      >
        {link.label} →
      </Link>
    </div>
  </li>
);

const FeatureColumn = ({
  label,
  tone,
  items,
}: {
  label: string;
  tone: Tone;
  items: { name: string; to: string }[];
}) => (
  <div className="rounded-md border border-line-2 p-4">
    <div className="mb-3">
      <Badge tone={tone}>{label}</Badge>
    </div>
    <ul className="space-y-2 text-sm">
      {items.map((it) => (
        <li key={`${label}-${it.name}`}>
          <Link
            to={it.to}
            className="flex items-center justify-between rounded px-2 py-1 text-ink-dim hover:bg-white/[0.04] hover:text-signal"
          >
            <span>{it.name}</span>
            <span className="text-ink-faint">→</span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const FAQ = ({ q, a }: { q: string; a: string }) => (
  <details className="group rounded-md border border-line-2 p-3 open:bg-panel-2">
    <summary className="cursor-pointer list-none text-sm font-medium text-ink group-open:text-signal">
      <span className="mr-2 text-ink-faint group-open:text-signal">›</span>
      {q}
    </summary>
    <p className="mt-2 pl-4 text-sm text-ink-dim">{a}</p>
  </details>
);

export default Learn;
