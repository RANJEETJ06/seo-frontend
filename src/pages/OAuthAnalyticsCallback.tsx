import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsApi, apiErrorMessage } from "../api";

/**
 * /oauth/google/analytics/callback
 *
 * Google redirects here with `?code=...&state=...` after the Analytics consent
 * screen. We post both to the backend, which exchanges the code and persists
 * the org's GAConnection. The ref guard prevents the React 18 dev double-submit
 * that would make Google reject the second call with "invalid_grant".
 */
const OAuthAnalyticsCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"connecting" | "ok" | "error">("connecting");
  const [message, setMessage] = useState<string>("Connecting your Google Analytics account…");
  const completed = useRef(false);

  useEffect(() => {
    if (completed.current) return;
    completed.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const errorParam = params.get("error");

    if (errorParam) {
      setStatus("error");
      setMessage(`Google sign-in was cancelled (${errorParam}).`);
      return;
    }
    if (!code || !state) {
      setStatus("error");
      setMessage("Missing authorization code from Google. Please try connecting again.");
      return;
    }

    const redirect = `${window.location.origin}/oauth/google/analytics/callback`;
    analyticsApi
      .completeAuth({ code, state, redirect_uri: redirect })
      .then((conn) => {
        setStatus("ok");
        setMessage(`Connected ${conn.account_email}. Redirecting…`);
        setTimeout(() => navigate("/analytics", { replace: true }), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(apiErrorMessage(err, "Could not connect Google Analytics account"));
      });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-panel-2 p-6">
      <div className="w-full max-w-md rounded-lg border border-line-2 bg-panel p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-ink">Google Analytics connection</h1>
        <p className={`mt-3 text-sm ${status === "error" ? "text-danger" : "text-ink-dim"}`}>
          {message}
        </p>
        {status === "error" && (
          <button
            type="button"
            onClick={() => navigate("/analytics")}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-signal px-4 py-2 text-sm font-medium text-[#0a0b0d] hover:bg-signal-press"
          >
            Back to Analytics
          </button>
        )}
      </div>
    </div>
  );
};

export default OAuthAnalyticsCallback;
