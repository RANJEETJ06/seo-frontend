import { Button } from "../components/Field";

type MaintenanceProps = {
  /** Whether a health re-check is currently in flight. */
  retrying?: boolean;
  /** Manually trigger a re-check of the backend. */
  onRetry?: () => void;
};

const Maintenance = ({ retrying = false, onRetry }: MaintenanceProps) => {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Atmospheric accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.12),transparent_60%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -right-32 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(251,113,133,0.1),transparent_60%)] blur-2xl"
      />

      <div className="w-full max-w-md animate-fade-up text-center">
        {/* Status mark */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-panel shadow-lift">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span className="eyebrow mb-3">AI&nbsp;SEO&nbsp;//&nbsp;Service&nbsp;Status</span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tightest text-ink">
            Server is under
            <br />
            <span className="text-signal">maintenance.</span>
          </h1>
          <p className="mt-3 max-w-xs text-sm text-ink-dim">
            We can't reach the backend right now. The console will reconnect
            automatically as soon as the service is back online.
          </p>
        </div>

        {/* Status panel */}
        <div className="rounded-2xl border border-line bg-panel bg-panel-sheen p-7 shadow-lift">
          <div className="flex items-center justify-center gap-2.5 text-sm text-ink-dim">
            <span
              className={`h-2 w-2 rounded-full ${
                retrying
                  ? "animate-pulse bg-[#fbbf24]"
                  : "bg-danger shadow-glow-soft"
              }`}
            />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">
              {retrying ? "Reconnecting…" : "Backend unavailable"}
            </span>
          </div>

          {onRetry && (
            <Button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="mt-6 w-full text-white"
            >
              {retrying ? "Checking…" : "Retry now"}
            </Button>
          )}
        </div>

        <p className="mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
          auto-retrying every few seconds
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
