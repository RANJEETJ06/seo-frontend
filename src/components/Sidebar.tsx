import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: "▦" },
  { to: "/analyze", label: "Analyze", icon: "◎" },
  { to: "/keywords", label: "Keywords", icon: "#" },
  { to: "/reports", label: "Reports", icon: "≣" },
  { to: "/crawler", label: "Crawler", icon: "⧗" },
  { to: "/competitor", label: "Competitor", icon: "⚔" },
  { to: "/ai-tools", label: "AI Tools", icon: "⚡" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
      <div className="p-6">
        <div className="text-lg font-semibold text-slate-900">
          AI SEO Platform
        </div>
        <div className="text-xs text-slate-500">v0.4.0</div>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
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
  );
};

export default Sidebar;
