import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

/**
 * Public landing page — the product's front door. Explains what the suite
 * actually does (SEO / AEO / GEO, and each tool) in plain language, then funnels
 * visitors into sign in / sign up. Intentionally link-light: the only calls to
 * action are "Get started" and "Sign in".
 */
const Landing = () => {
  const token = useAuthStore((s) => s.token);
  const primaryTo = token ? "/dashboard" : "/login";
  const primaryLabel = token ? "Open dashboard" : "Get started free";

  return (
    <div className="min-h-screen">
      <TopNav token={token} />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(0,237,100,0.16),transparent_62%)] blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-signal shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-bright" />
              SEO · AEO · GEO in one place
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl">
              Get found by search,
              <br />
              answers, and{" "}
              <span className="relative whitespace-nowrap text-signal">
                AI.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C40 3 160 3 198 9"
                    stroke="var(--signal-bright)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-dim">
              Lumen audits your site, scores how visible you are to Google,
              answer boxes, and AI assistants like ChatGPT — then hands you the
              exact, ready-to-apply fixes. Smooth, lightweight, no clutter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={primaryTo}
                className="ring-signal inline-flex items-center gap-2 rounded-full bg-signal-bright px-6 py-3 text-sm font-semibold text-signal-ink shadow-glow-soft transition-all hover:shadow-glow"
              >
                {primaryLabel} →
              </Link>
              {!token && (
                <Link
                  to="/login"
                  className="ring-signal inline-flex items-center gap-2 rounded-full border border-line-2 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-signal hover:text-signal"
                >
                  Sign in
                </Link>
              )}
            </div>
            <p className="mt-4 text-xs text-ink-faint">
              No credit card. No API keys required to run your first audit.
            </p>
          </div>

          {/* Floating product mock */}
          <HeroVisual />
        </div>
      </section>

      {/* ---------------- Three engines ---------------- */}
      <Section
        eyebrow="The three disciplines"
        title="Search changed. Visibility now lives in three places."
        subtitle="Five years ago, ranking on Google was the whole game. Today, much of search never reaches a results page — it ends inside an answer box or an AI reply. Lumen covers all three layers."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <EngineCard
            tag="SEO"
            tone="forest"
            heading="Search Engine Optimization"
            line="Rank on the classic blue links."
            body="Crawlable HTML, strong titles and meta, clean headings, fast Core Web Vitals, healthy internal links and no broken pages. The foundation everything else builds on."
          />
          <EngineCard
            tag="AEO"
            tone="spring"
            heading="Answer Engine Optimization"
            line="Win the answer box & voice."
            body="Question-style headings, concise 40–60 word answers, FAQ and HowTo schema, lists and tables. So assistants and snippets read your answer out loud."
          />
          <EngineCard
            tag="GEO"
            tone="forest"
            heading="Generative Engine Optimization"
            line="Get cited by ChatGPT & friends."
            body="Clear factual claims with sources, entity clarity, and structured data that large language models can extract and attribute back to your site."
          />
        </div>
      </Section>

      {/* ---------------- Feature deep dive ---------------- */}
      <Section
        eyebrow="What's inside"
        title="Every tool you need, none you don't."
        subtitle="A focused toolkit — each part does one job well, and they share the same clean workspace."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Feature
            icon={
              <>
                <circle cx="11" cy="11" r="7" />
                <path d="M11 7v8M7 11h8" />
                <path d="m20 20-3.2-3.2" />
              </>
            }
            title="Full SEO analysis"
            body="Crawl any URL and get scored on titles, meta, headings, content, links and technical health — with AI recommendations that read like a senior consultant wrote them."
          />
          <Feature
            icon={
              <>
                <path d="M4 14a8 8 0 0 1 16 0" />
                <path d="M12 14l4-3" />
                <path d="M4 14h2M18 14h2" />
              </>
            }
            title="Technical audit & JSON-LD"
            body="Measure Core Web Vitals and structured-data coverage — the foundation of AEO and GEO. Lumen even generates ready-to-paste JSON-LD for the schema your page is missing."
          />
          <Feature
            icon={
              <>
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                <circle cx="12" cy="12" r="2.6" />
              </>
            }
            title="AI visibility score"
            body="See how quotable your page is to AI answer engines, generate People-Also-Ask questions, and surface the definitions assistants love to cite."
          />
          <Feature
            icon={
              <>
                <path d="M9 4 7 20M17 4l-2 16M5 9h15M4 15h15" />
              </>
            }
            title="Keyword clustering"
            body="Pull the strongest keywords from any URL or pasted text and group them into themes — perfect for planning FAQ content and topic hubs."
          />
          <Feature
            icon={
              <>
                <circle cx="12" cy="12" r="8" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                <circle cx="12" cy="12" r="2.4" />
              </>
            }
            title="Competitor gap analysis"
            body="Audit your URL side-by-side with up to ten competitors. Instantly see what they cover that you don't — and where the easy wins are."
          />
          <Feature
            icon={
              <>
                <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
              </>
            }
            title="Human-in-the-loop link building"
            body="Internal-link suggestions, guest-post outlines, pre-filled directory submissions and broken-link finds. Nothing ever auto-posts — every action is queued for you to review."
          />
        </div>
      </Section>

      {/* ---------------- Why all three band ---------------- */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-line bg-signal-grad p-10 shadow-lift sm:p-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight text-signal-ink sm:text-4xl">
              Optimise for one engine and you're invisible on the rest.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#00352a]">
              The three disciplines overlap — clean HTML, good structure and
              schema help them all — but each has its own tactics. Lumen gives
              you the tooling for every layer, so a query gets answered by you
              no matter where it lands.
            </p>
            <Link
              to={primaryTo}
              className="ring-signal mt-7 inline-flex items-center gap-2 rounded-full bg-[#00150f] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {primaryLabel} →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <Section
        eyebrow="Good to know"
        title="Questions, answered."
        subtitle=""
      >
        <div className="mx-auto max-w-3xl space-y-3">
          <Faq
            q="Do I need a Gemini or PageSpeed API key to start?"
            a="No. Every analyser falls back to deterministic heuristics when no key is configured. Adding keys later unlocks richer AI recommendations and real PageSpeed Insights data — but you can run your first audit with nothing configured."
          />
          <Faq
            q="Does the backlink builder auto-post links?"
            a="Never. Every outreach email, directory submission and internal-link patch is queued for you to review and apply manually. It's a deliberate, hard-coded design choice."
          />
          <Faq
            q="Where do AEO and GEO actually live in the app?"
            a="Mainly in the Technical Audit. The schema auditor recommends FAQPage markup (AEO) when it finds question-style headings, recommends Organization/Article markup (GEO) for entity clarity, and generates the JSON-LD for whichever your page needs most."
          />
          <Faq
            q="Is it really free to begin?"
            a="Yes — create a workspace, add a project and run audits without a card. You only ever connect external accounts when you choose to use outreach features."
          />
        </div>
      </Section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="px-6 pb-24 pt-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-ink">
            Run your first audit in under a minute.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-dim">
            Create a free workspace and see exactly where you stand across
            search, answers and AI.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to={primaryTo}
              className="ring-signal inline-flex items-center gap-2 rounded-full bg-signal-bright px-8 py-3.5 text-base font-semibold text-signal-ink shadow-glow-soft transition-all hover:shadow-glow"
            >
              {primaryLabel} →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ----------------------------- pieces ----------------------------- */

const HeroVisual = () => {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const score = 92;
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(0,237,100,0.18),transparent_70%)] blur-2xl"
      />
      <div className="relative animate-float rounded-3xl border border-line bg-panel p-6 shadow-lift">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-ink-faint">Visibility score</div>
            <div className="font-display text-sm font-bold text-ink">example.com</div>
          </div>
          <span className="rounded-full bg-signal-soft px-2.5 py-1 text-[0.7rem] font-bold text-signal">
            Healthy
          </span>
        </div>

        <div className="mt-5 flex items-center gap-6">
          <div className="relative grid h-32 w-32 place-items-center">
            <svg width="128" height="128" className="-rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                strokeWidth="10"
                className="stroke-[rgba(1,48,43,0.08)]"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                strokeWidth="10"
                strokeLinecap="round"
                className="stroke-signal-bright"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - score / 100)}
                fill="none"
                style={{ filter: "drop-shadow(0 0 6px var(--signal-glow))" }}
              />
            </svg>
            <div className="absolute font-display text-3xl font-bold tabular-nums text-ink">
              {score}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {[
              { label: "SEO", val: 94 },
              { label: "AEO", val: 88 },
              { label: "GEO", val: 90 },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-ink-dim">{m.label}</span>
                  <span className="tabular-nums text-ink-faint">{m.val}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
                  <div
                    className="h-full rounded-full bg-signal-grad"
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-line pt-4">
          {[
            "Add FAQPage JSON-LD to /pricing",
            "Tighten title on 3 pages",
            "Fix 2 broken internal links",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-sm text-ink-dim">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-signal-bright text-[9px] text-signal-ink">
                ✓
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BrandMark = () => (
  <div className="flex items-center gap-2.5">
    <div className="grid h-8 w-8 place-items-center rounded-xl bg-signal-grad shadow-glow-soft">
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M6 21 L13 13 L18 17 L25 8"
          stroke="#00150f"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="25" cy="8" r="2.6" fill="#00150f" />
      </svg>
    </div>
    <span className="font-display text-lg font-bold tracking-tight text-ink">
      Lumen
    </span>
  </div>
);

const TopNav = ({ token }: { token: string | null }) => (
  <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
      <Link to="/" aria-label="Lumen home">
        <BrandMark />
      </Link>
      <div className="flex items-center gap-2">
        {token ? (
          <Link
            to="/dashboard"
            className="ring-signal rounded-full bg-signal-bright px-5 py-2 text-sm font-semibold text-signal-ink shadow-glow-soft transition-all hover:shadow-glow"
          >
            Open dashboard →
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="ring-signal rounded-full px-4 py-2 text-sm font-semibold text-ink-dim transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="ring-signal rounded-full bg-signal-bright px-5 py-2 text-sm font-semibold text-signal-ink shadow-glow-soft transition-all hover:shadow-glow"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </div>
  </header>
);

const Section = ({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <section className="px-6 py-16">
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-base leading-relaxed text-ink-dim">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  </section>
);

const EngineCard = ({
  tag,
  tone,
  heading,
  line,
  body,
}: {
  tag: string;
  tone: "spring" | "forest";
  heading: string;
  line: string;
  body: string;
}) => (
  <div className="group relative flex flex-col rounded-2xl border border-line bg-panel p-6 shadow-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
        tone === "spring"
          ? "bg-signal-bright text-signal-ink"
          : "bg-signal-soft text-signal"
      }`}
    >
      {tag}
    </span>
    <h3 className="mt-4 font-display text-xl font-bold text-ink">{heading}</h3>
    <p className="mt-1 text-sm font-medium text-signal">{line}</p>
    <p className="mt-3 text-sm leading-relaxed text-ink-dim">{body}</p>
  </div>
);

const Feature = ({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) => (
  <div className="flex gap-4 rounded-2xl border border-line bg-panel p-6 shadow-panel transition-shadow duration-300 hover:shadow-lift">
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal-soft text-signal">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {icon}
      </svg>
    </div>
    <div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{body}</p>
    </div>
  </div>
);

const Faq = ({ q, a }: { q: string; a: string }) => (
  <details className="group rounded-2xl border border-line bg-panel px-5 py-4 shadow-panel open:shadow-lift">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink">
      {q}
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-signal transition-transform duration-200 group-open:rotate-45">
        +
      </span>
    </summary>
    <p className="mt-3 text-sm leading-relaxed text-ink-dim">{a}</p>
  </details>
);

const Footer = () => (
  <footer className="border-t border-line">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
      <BrandMark />
      <p className="text-xs text-ink-faint">
        © {new Date().getFullYear()} Lumen · SEO, AEO & GEO suite
      </p>
    </div>
  </footer>
);

export default Landing;
