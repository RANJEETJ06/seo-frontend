import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import OrgSwitcher from "./OrgSwitcher";

/* Hand-drawn line icons — 18px, 1.6 stroke, currentColor. */
const I = ({ children }: { children: ReactNode }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const icons: Record<string, ReactNode> = {
  "/dashboard": (
    <I>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </I>
  ),
  "/analyze": (
    <I>
      <circle cx="11" cy="11" r="7" />
      <path d="M11 7v8M7 11h8" />
      <path d="m20 20-3.2-3.2" />
    </I>
  ),
  "/tech-audit": (
    <I>
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="M12 14l4-3" />
      <path d="M4 14h2M18 14h2M12 6v1" />
    </I>
  ),
  "/ai-visibility": (
    <I>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </I>
  ),
  "/keywords": (
    <I>
      <path d="M9 4 7 20M17 4l-2 16M5 9h15M4 15h15" />
    </I>
  ),
  "/rank-tracking": (
    <I>
      <path d="M3 17l5-5 4 4 8-8" />
      <path d="M16 8h4v4" />
    </I>
  ),
  "/search-console": (
    <I>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
      <path d="M8.5 11h5M11 8.5v5" />
    </I>
  ),
  "/analytics": (
    <I>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </I>
  ),
  "/reports": (
    <I>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="m3 12 9 4.5L21 12" />
      <path d="m3 16.5 9 4.5 9-4.5" />
    </I>
  ),
  "/crawler": (
    <I>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.3 4 5.6 4 9s-1.4 6.7-4 9c-2.6-2.3-4-5.6-4-9s1.4-6.7 4-9Z" />
    </I>
  ),
  "/competitor": (
    <I>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="2.4" />
    </I>
  ),
  "/ai-tools": (
    <I>
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
    </I>
  ),
  "/settings": (
    <I>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="8" cy="17" r="2.2" />
    </I>
  ),
};

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analyze", label: "Analyze" },
  { to: "/tech-audit", label: "Tech Audit" },
  { to: "/ai-visibility", label: "AI Visibility" },
  { to: "/keywords", label: "Keywords" },
  { to: "/rank-tracking", label: "Rank Tracking" },
  { to: "/search-console", label: "Search Console" },
  { to: "/analytics", label: "Google Analytics" },
  { to: "/reports", label: "Reports" },
  { to: "/crawler", label: "Crawler" },
  { to: "/competitor", label: "Competitor" },
  { to: "/ai-tools", label: "AI Tools" },
  { to: "/settings", label: "Settings" },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const initial = (user?.full_name || user?.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-bg-soft/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-signal-grad shadow-glow-soft">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
            <div className="leading-tight">
              <div className="font-display text-[1rem] font-bold tracking-tight text-ink">
                Lumen
              </div>
              <div className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-ink-faint">
                SEO · AEO · GEO
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-faint hover:bg-panel-2 hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <I>
              <path d="M18 6 6 18M6 6l12 12" />
            </I>
          </button>
        </div>

        <div className="mx-5 mb-3 h-px bg-line" />

        {/* Active organization (tenant) switcher */}
        <div className="pb-3">
          <OrgSwitcher />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={{ animationDelay: `${i * 30}ms` }}
              className={({ isActive }) =>
                `group relative mb-0.5 flex animate-fade-up items-center gap-3 rounded-xl px-3 py-2 text-[0.85rem] transition-colors ${
                  isActive
                    ? "bg-signal-soft text-signal"
                    : "text-ink-dim hover:bg-panel-2 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-signal-bright transition-all duration-200 ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                    aria-hidden="true"
                  />
                  <span className={isActive ? "text-signal" : "text-ink-faint group-hover:text-ink-dim"}>
                    {icons[item.to]}
                  </span>
                  <span className={isActive ? "font-semibold" : "font-medium"}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-panel-2 p-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line-2 bg-white font-display text-sm font-bold text-signal">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[0.8rem] font-medium text-ink">
                {user?.full_name || user?.email}
              </div>
              <div className="truncate text-[0.68rem] text-ink-faint">
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="ring-signal rounded-lg p-2 text-ink-faint transition-colors hover:bg-white hover:text-danger"
              aria-label="Sign out"
            >
              <I>
                <path d="M15 17l5-5-5-5M20 12H9M9 4H5v16h4" />
              </I>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
