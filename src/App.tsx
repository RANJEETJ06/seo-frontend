import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import HealthGate from "./components/HealthGate";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AnalyzeWebsite from "./pages/AnalyzeWebsite";
import Keywords from "./pages/Keywords";
import Reports from "./pages/Reports";
import Crawler from "./pages/Crawler";
import Competitor from "./pages/Competitor";
import AITools from "./pages/AITools";
import TechAudit from "./pages/TechAudit";
import AIVisibility from "./pages/AIVisibility";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import OAuthGoogleCallback from "./pages/OAuthGoogleCallback";

function App() {
  const loadCurrentUser = useAuthStore((s) => s.loadCurrentUser);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  return (
    <HealthGate>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth/google/callback" element={<OAuthGoogleCallback />} />

          {/* App (auth-gated) */}
          <Route element={<ProtectedRoute />}>
            {/* Onboarding sits inside auth but outside the app shell */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyze" element={<AnalyzeWebsite />} />
              <Route path="/keywords" element={<Keywords />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/crawler" element={<Crawler />} />
              <Route path="/competitor" element={<Competitor />} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/tech-audit" element={<TechAudit />} />
              <Route path="/ai-visibility" element={<AIVisibility />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HealthGate>
  );
}

export default App;
