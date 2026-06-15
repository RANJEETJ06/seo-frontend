import { useEffect, useRef, useState } from "react";
import { useOrgStore } from "../store/org";

/**
 * Workspace (organization) switcher shown in the sidebar.
 *
 * Lists every org the user belongs to and lets them switch the active tenant
 * (re-issues the token, reloads) or spin up a new team org. The active org
 * determines which projects/reports/etc. the rest of the app sees.
 */
const OrgSwitcher = () => {
  const { organizations, current, switching, switchTo, createAndSwitch, load } =
    useOrgStore();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Ensure data is present even if the switcher mounts before auth finished.
  useEffect(() => {
    if (!current && organizations.length === 0) void load();
  }, [current, organizations.length, load]);

  // Close the popover on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createAndSwitch(trimmed);
    } catch {
      // error surfaced via store; keep the form open
    }
  };

  const label = current?.name ?? "Workspace";

  return (
    <div ref={ref} className="relative px-3">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={switching}
        className="ring-signal flex w-full items-center gap-2.5 rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-left transition-colors hover:border-line-2 disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-signal-soft font-display text-xs font-bold text-signal">
          {label.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.8rem] font-semibold text-ink">
            {switching ? "Switching…" : label}
          </span>
          <span className="block truncate text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
            {current?.is_personal ? "Personal" : current?.role ?? "Organization"}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-faint" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-3 right-3 z-50 mt-1.5 overflow-hidden rounded-xl border border-line bg-panel shadow-lift">
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {organizations.map((org) => (
              <li key={org.id}>
                <button
                  onClick={() => {
                    setOpen(false);
                    void switchTo(org.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.8rem] transition-colors hover:bg-panel-2"
                  role="option"
                  aria-selected={org.id === current?.id}
                >
                  <span className="min-w-0 flex-1 truncate text-ink">{org.name}</span>
                  {org.is_personal && (
                    <span className="text-[0.6rem] uppercase tracking-wide text-ink-faint">
                      Personal
                    </span>
                  )}
                  {org.id === current?.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-signal" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-line p-2">
            {creating ? (
              <div className="flex gap-1.5">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Organization name"
                  className="ring-signal w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-signal"
                />
                <button
                  onClick={handleCreate}
                  disabled={switching || !name.trim()}
                  className="ring-signal shrink-0 rounded-lg bg-signal-bright px-2.5 py-1.5 text-xs font-semibold text-signal-ink disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="ring-signal flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.8rem] font-medium text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New organization
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSwitcher;
