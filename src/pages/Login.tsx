import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
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
        ?.pathname ?? "/dashboard";
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
      navigate("/dashboard");
    } catch {
      // error is surfaced via store
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Soft mint atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(0,237,100,0.18),transparent_62%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -right-32 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(0,104,74,0.12),transparent_62%)] blur-2xl"
      />

      <div className="w-full max-w-md animate-fade-up">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-signal-grad shadow-glow-soft"
            aria-label="Back to home"
          >
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M6 21 L13 13 L18 17 L25 8"
                stroke="#00150f"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="25" cy="8" r="2.6" fill="#00150f" />
            </svg>
          </Link>
          <span className="eyebrow mb-3">
            {mode === "login" ? "Welcome back" : "Get started free"}
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink">
            {mode === "login" ? (
              <>
                Sign in to
                <br />
                <span className="text-signal">Lumen.</span>
              </>
            ) : (
              <>
                Create your
                <br />
                <span className="text-signal">workspace.</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-xs text-sm text-ink-dim">
            SEO audits, AI visibility, and human-in-the-loop link building — in
            one calm workspace.
          </p>
        </div>

        {/* Form panel */}
        <div className="rounded-2xl border border-line bg-panel p-7 shadow-lift">
          {/* Segmented mode toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-panel-2 p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`ring-signal rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === m
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                {m === "login" ? "Sign in" : "Sign up"}
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
              <div className="flex items-start gap-2 rounded-xl border border-[rgba(212,38,78,0.25)] bg-[rgba(212,38,78,0.07)] px-3 py-2.5 text-sm text-danger">
                <span className="mt-0.5 text-xs">▲</span>
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Just a moment…"
                : mode === "login"
                  ? "Sign in →"
                  : "Create account →"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-semibold text-signal hover:underline"
              >
                Create a free account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-signal hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
