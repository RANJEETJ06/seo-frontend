import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close drawer whenever the route changes (covers programmatic navigation too).
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <div className="relative z-10 flex min-h-screen bg-transparent text-ink">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg-soft/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="ring-signal rounded-md p-2 text-ink-dim hover:bg-white/5 hover:text-ink"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-glow-soft" />
            <span className="font-display text-sm font-bold text-ink">
              AI&nbsp;SEO
            </span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1 overflow-auto">
          <div
            key={location.pathname}
            className="mx-auto max-w-7xl animate-fade-in p-4 sm:p-6 lg:p-10"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
