import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useOrgStore, onboarding } from "../store/org";
import { Field, TextInput, Button } from "../components/Field";

/**
 * Post-sign-up onboarding: prompt the user to create their team organization
 * before they start working. They can skip and keep using the personal
 * workspace the backend seeded at registration; the skip is remembered.
 */
const Onboarding = () => {
  const navigate = useNavigate();
  const { current, switching, error, createAndSwitch } = useOrgStore();
  const [name, setName] = useState("");

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      // Creates the org, switches into it, and reloads to the dashboard.
      await createAndSwitch(trimmed);
    } catch {
      // error surfaced via store
    }
  };

  const handleSkip = () => {
    onboarding.skip();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(0,237,100,0.18),transparent_62%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -right-32 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(0,104,74,0.12),transparent_62%)] blur-2xl"
      />

      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-signal-grad shadow-glow-soft">
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
          </div>
          <span className="eyebrow mb-3">Step 1 of 1</span>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink">
            Create your
            <br />
            <span className="text-signal">organization.</span>
          </h1>
          <p className="mt-3 max-w-xs text-sm text-ink-dim">
            Organizations let you group projects and invite teammates. You can
            always create more — or keep working solo in your personal
            workspace.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-7 shadow-lift">
          <form onSubmit={handleCreate} className="space-y-4">
            <Field
              label="Organization name"
              hint="e.g. your company or team name"
            >
              <TextInput
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc."
                maxLength={255}
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-[rgba(212,38,78,0.25)] bg-[rgba(212,38,78,0.07)] px-3 py-2.5 text-sm text-danger">
                <span className="mt-0.5 text-xs">▲</span>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={switching || !name.trim()}
              className="w-full"
            >
              {switching ? "Creating…" : "Create organization →"}
            </Button>
          </form>

          <button
            type="button"
            onClick={handleSkip}
            disabled={switching}
            className="ring-signal mt-4 w-full rounded-full px-5 py-2.5 text-sm font-medium text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
          >
            Continue with personal workspace
            {current?.name ? ` (${current.name})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
