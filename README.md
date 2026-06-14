# AI SEO Platform — Frontend

React + TypeScript + Vite single-page app for the AI SEO Platform. Talks to the
FastAPI backend under `/api/v1`: SEO analysis, tech audit, AI visibility,
keywords, crawler, the AI Tools suite (recommendations, backlink builder, RAG),
and the Gmail-connected outreach workflow.

## Stack

- **React 19** + **TypeScript** + **Vite** (React Compiler enabled)
- **React Router 7** — routing (`src/App.tsx`)
- **Zustand** — state (auth store)
- **Axios** — API client (`src/api/client.ts`)
- **Tailwind CSS** — styling

## Quick start

```bash
cd frontend
npm install
npm run dev        # vite dev server (http://localhost:3000)
npm run build      # tsc -b && vite build
npm run lint       # eslint
npm run preview    # serve the production build
```

### Environment

The API base URL is read from Vite env (`import.meta.env`). Create
`frontend/.env` (or `.env.local`) if your backend isn't at the default:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Deploys to **Vercel** (`vercel.json`).

## Project layout

```
frontend/src/
├── api/            # API client + per-domain modules (auth, seo, ai, outreach)
│   ├── client.ts   #   axios instance (baseURL, auth header, error helper)
│   ├── seo.ts      #   analysis, tech-audit, ai-visibility, task polling
│   ├── ai.ts       #   AI Tools (recommend, backlinks, rag) — submit+poll
│   └── outreach.ts #   Gmail accounts, templates, campaigns, send, dashboard
├── components/
│   ├── Card.tsx, Field.tsx, Layout.tsx, ScoreGauge.tsx, Sidebar.tsx
│   └── outreach/   # EmailAccountsPanel, CampaignsPanel, TemplatesPanel, OutreachDashboard
├── hooks/
│   └── useTaskPolling.ts   # poll /tasks/{id} until SUCCESS/FAILURE
├── pages/          # one per route (see below)
├── routes/         # route guards / wrappers
├── store/          # Zustand stores (auth)
└── types/          # shared TS types (request/response, TaskStatusResponse, …)
```

## Routes / pages

| Path | Page | Notes |
|---|---|---|
| `/login` | `Login` | email + password → JWT |
| `/` | `Dashboard` | overview |
| `/learn` | `Learn` | feature explainers |
| `/analyze` | `AnalyzeWebsite` | full SEO analysis (async task) |
| `/tech-audit` | `TechAudit` | Core Web Vitals + schema (async task) |
| `/ai-visibility` | `AIVisibility` | GEO + AEO audit (async task) |
| `/keywords` | `Keywords` | extraction + clustering |
| `/reports` | `Reports` | saved reports |
| `/crawler` | `Crawler` | site crawl + sitemap |
| `/competitor` | `Competitor` | competitor analysis (async task) |
| `/ai-tools` | `AITools` | Recommend · Backlinks · Builder · Outreach · RAG |
| `/settings` | `Settings` | account + **Email Accounts** (connect Gmail) |
| `/oauth/google/callback` | `OAuthGoogleCallback` | Google OAuth redirect target |

## Async tasks (important)

Several backend endpoints don't return results directly — they enqueue a Celery
job and return `202` + `{ task_id }`. The client polls `GET /tasks/{task_id}`
until it's `SUCCESS`/`FAILURE`.

- **SEO pages** (analyze, tech-audit, ai-visibility, competitor) use the
  `useTaskPolling` hook to show progress + result.
- **AI Tools** (`backlinks`, `internal-export`, `discover`, `broken-links`,
  `guest-post`, `rag ingest`) hide this inside `src/api/ai.ts`: each method
  **submits then polls internally** (`submitAndPoll`) and resolves with the
  final result, so calling components don't change. Default poll: every 2s, up
  to ~5 min.

A Celery worker **must be running** on the backend for these to complete.

## Outreach / Gmail flow (UI)

1. **Settings → Email Accounts → Connect Gmail** — OAuth; redirect URI is
   `${window.location.origin}/oauth/google/callback` (register it in Google
   Cloud Console).
2. **AI Tools → Builder → Discover prospects** (or **Broken links**) with
   *save to queue* on — generates drafted emails.
3. **AI Tools → Builder → Queue** — review and **Approve** drafts.
4. **AI Tools → Outreach → Campaigns** — create a campaign from approved
   prospects, pick the Gmail account, **Send now**. Track in **Outreach →
   Dashboard**.

## Conventions

- All HTTP goes through `apiClient` (`src/api/client.ts`); it injects the JWT
  and centralizes error messages (`apiErrorMessage`).
- Shared types live in `src/types`; keep request/response shapes in sync with
  the backend Pydantic schemas.
- New async endpoint? Return `202`/`{ task_id }` on the backend and reuse
  `useTaskPolling` or `submitAndPoll` — don't block on long requests.
