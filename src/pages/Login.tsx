import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { Field, TextInput, Button } from "../components/Field";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading, error, token } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  if (token) {
    const from =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, full_name: fullName || undefined });
      }
      navigate("/");
    } catch {
      // error is surfaced via store
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Atmospheric accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(202,249,76,0.14),transparent_60%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -right-32 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.1),transparent_60%)] blur-2xl"
      />

      <div className="w-full max-w-md animate-fade-up">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-signal-grad shadow-glow">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M6 21 L13 13 L18 17 L25 8"
                stroke="#0a0b0d"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="25" cy="8" r="2.6" fill="#0a0b0d" />
            </svg>
          </div>
          <span className="eyebrow mb-3">AI&nbsp;SEO&nbsp;//&nbsp;Signal&nbsp;Console</span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tightest text-ink">
            {mode === "login" ? (
              <>
                Tune your
                <br />
                <span className="text-signal">search signal.</span>
              </>
            ) : (
              <>
                Start reading
                <br />
                <span className="text-signal">the signal.</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-xs text-sm text-ink-dim">
            Technical audits, AI visibility, and human-in-the-loop link
            building — in one instrument.
          </p>
        </div>

        {/* Form panel */}
        <div className="rounded-2xl border border-line bg-panel bg-panel-sheen p-7 shadow-lift">
          {/* Segmented mode toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-line bg-bg-soft p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`ring-signal rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-white/[0.06] text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                    : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Full name (optional)">
                <TextInput
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Email">
              <TextInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field
              label="Password"
              hint={mode === "register" ? "At least 8 characters" : undefined}
            >
              <TextInput
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-[rgba(251,113,133,0.25)] bg-[rgba(251,113,133,0.1)] px-3 py-2.5 text-sm text-danger">
                <span className="mt-0.5 text-xs">▲</span>
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full text-white">
              {loading
                ? "Authenticating…"
                : mode === "login"
                  ? "Sign in →"
                  : "Create account →"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
          v0.4.0 · secured by JWT
        </p>
      </div>
    </div>
  );
};

export default Login;
