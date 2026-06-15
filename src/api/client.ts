import axios from "axios";
import type { AxiosError } from "axios";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

// Probe health under the SAME base as every other API call (the backend serves
// it at `${API_V1_PREFIX}/health`). This is deliberate: in prod the API is
// usually behind an ingress that only routes `/api/v1/*` to the backend, so a
// root-level `/health` probe would hit the static/SPA host instead and the app
// would be stuck on the maintenance screen. Tying health to the API base means
// "if the API is reachable, health is reachable" — and it works with a relative
// base URL (e.g. "/api/v1") for same-origin deploys, where building a URL from
// the origin would otherwise break.
export const healthUrl = `${baseURL.replace(/\/+$/, "")}/health`;

/**
 * Probe the backend's /health endpoint. Resolves true when the server is
 * reachable and reports a healthy status, false otherwise. Never throws —
 * a rejected request (network error, timeout, 5xx) means "down".
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await axios.get(healthUrl, { timeout: 5000 });
    const status = res.data?.status;
    // Accept the documented {"status":"ok"} plus common variants ("up").
    if (typeof status === "string") {
      return ["ok", "up", "healthy"].includes(status.toLowerCase());
    }
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

const TOKEN_KEY = "seo_access_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Request failed"): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length) {
      return detail.map((d: { msg?: string }) => d.msg ?? "").join("; ");
    }
    // Structured error from the outreach surface: { code, message, detail }.
    if (detail && typeof detail === "object") {
      const obj = detail as { message?: string; code?: string; detail?: string };
      if (obj.message) {
        const base =
          obj.code && obj.code !== "gmail_error"
            ? `${obj.message} (${obj.code})`
            : obj.message;
        // `detail` carries the raw provider reason (e.g. Google's
        // error_description) — append it when it adds information.
        return obj.detail && obj.detail !== obj.message
          ? `${base} — ${obj.detail}`
          : base;
      }
    }
    return err.message || fallback;
  }
  return fallback;
}

/** Pull a stable error code out of an axios error, if present. */
export function apiErrorCode(err: unknown): string | null {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (detail && typeof detail === "object" && "code" in detail) {
      return (detail as { code?: string }).code ?? null;
    }
  }
  return null;
}
