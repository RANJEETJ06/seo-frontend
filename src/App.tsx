import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AnalyzeWebsite from "./pages/AnalyzeWebsite";
import Keywords from "./pages/Keywords";
import Reports from "./pages/Reports";
import Crawler from "./pages/Crawler";
import Competitor from "./pages/Competitor";
import AITools from "./pages/AITools";
import Settings from "./pages/Settings";

function App() {
  const loadCurrentUser = useAuthStore((s) => s.loadCurrentUser);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyze" element={<AnalyzeWebsite />} />
            <Route path="/keywords" element={<Keywords />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/crawler" element={<Crawler />} />
            <Route path="/competitor" element={<Competitor />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
