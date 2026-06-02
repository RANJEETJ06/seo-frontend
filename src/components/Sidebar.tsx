import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: "▦" },
  { to: "/learn", label: "Learn", icon: "✦" },
  { to: "/analyze", label: "Analyze", icon: "◎" },
  { to: "/tech-audit", label: "Tech Audit", icon: "⚙" },
  { to: "/ai-visibility", label: "AI Visibility", icon: "🤖" },
  { to: "/keywords", label: "Keywords", icon: "#" },
  { to: "/reports", label: "Reports", icon: "≣" },
  { to: "/crawler", label: "Crawler", icon: "⧗" },
  { to: "/competitor", label: "Competitor", icon: "⚔" },
  { to: "/ai-tools", label: "AI Tools", icon: "⚡" },
  { to: "/settings", label: "Settings", icon: "⚙" },
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

  return (
    <>
      {/* Backdrop (mobile only, when open) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              AI SEO Platform
            </div>
            <div className="text-xs text-slate-500">v0.4.0</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-2 truncate text-sm font-medium text-slate-700">
            {user?.full_name || user?.email}
          </div>
          <div className="mb-3 truncate text-xs text-slate-500">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
