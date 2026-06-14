import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { checkHealth } from "../api/client";
import Maintenance from "../pages/Maintenance";

// Poll cadence: probe slowly while the backend is healthy, faster while it's
// down so the app reconnects promptly once the service recovers.
const HEALTHY_INTERVAL_MS = 30_000;
const DOWN_INTERVAL_MS = 5_000;

type Status = "checking" | "up" | "down";

type HealthGateProps = {
  children: ReactNode;
};

/**
 * Gates the app on backend availability. Runs an initial /health probe and
 * keeps polling; renders the maintenance page whenever the backend is
 * unreachable, and restores the app automatically once it comes back.
 */
const HealthGate = ({ children }: HealthGateProps) => {
  const [status, setStatus] = useState<Status>("checking");
  const [retrying, setRetrying] = useState(false);
  const inFlightRef = useRef(false);

  const probe = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setRetrying(true);
    try {
      const ok = await checkHealth();
      setStatus(ok ? "up" : "down");
    } finally {
      inFlightRef.current = false;
      setRetrying(false);
    }
  }, []);

  // Initial probe on mount.
  useEffect(() => {
    void probe();
  }, [probe]);

  // Re-arm the next poll whenever status settles.
  useEffect(() => {
    if (status === "checking") return;
    const delay = status === "up" ? HEALTHY_INTERVAL_MS : DOWN_INTERVAL_MS;
    const timer = setTimeout(() => void probe(), delay);
    return () => clearTimeout(timer);
  }, [status, probe]);

  // Initial probe in flight — keep the screen blank to avoid a flash of the
  // app before we know whether the backend is reachable.
  if (status === "checking") return null;

  if (status === "down") {
    return <Maintenance retrying={retrying} onRetry={probe} />;
  }

  return <>{children}</>;
};

export default HealthGate;
