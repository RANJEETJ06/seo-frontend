import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useOrgStore, needsOnboarding } from "../store/org";

const ProtectedRoute = () => {
  const { token, initialized } = useAuthStore();
  const { loaded, organizations } = useOrgStore();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Wait for org data before deciding whether to prompt onboarding, so we don't
  // flash the app and then bounce the user to the create-org screen.
  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  // First-run prompt: nudge new users to create a team org before working.
  // They can skip (handled on the onboarding screen) to keep their personal
  // workspace. Don't redirect if they're already there.
  if (
    location.pathname !== "/onboarding" &&
    needsOnboarding(loaded, organizations)
  ) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
