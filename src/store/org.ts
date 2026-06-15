import { create } from "zustand";
import { organizationsApi, tokenStorage, apiErrorMessage } from "../api";
import type { OrganizationSummary } from "../types";

// Onboarding: after sign-up we prompt the user to create a team organization,
// but they may skip and keep using their personal workspace. The skip is
// remembered so we don't nag on every visit.
const ONBOARDING_SKIP_KEY = "seo_onboarding_skipped";

export const onboarding = {
  skipped: () => localStorage.getItem(ONBOARDING_SKIP_KEY) === "1",
  skip: () => localStorage.setItem(ONBOARDING_SKIP_KEY, "1"),
  reset: () => localStorage.removeItem(ONBOARDING_SKIP_KEY),
};

/** Whether the create-org prompt should be shown for the loaded org set. */
export const needsOnboarding = (
  loaded: boolean,
  organizations: OrganizationSummary[]
): boolean =>
  loaded &&
  organizations.length > 0 &&
  !organizations.some((o) => !o.is_personal) &&
  !onboarding.skipped();

interface OrgState {
  organizations: OrganizationSummary[];
  current: OrganizationSummary | null;
  loading: boolean;
  /** True once the first load attempt has resolved (success or failure). */
  loaded: boolean;
  switching: boolean;
  error: string | null;
  /** Load the org list + the active org for the current token. */
  load: () => Promise<void>;
  /** Switch the active org: re-issues the token and reloads so every
   *  org-scoped view (projects, reports, …) refetches under the new tenant. */
  switchTo: (orgId: number) => Promise<void>;
  /** Create a team org and immediately switch into it. */
  createAndSwitch: (name: string) => Promise<void>;
  reset: () => void;
}

export const useOrgStore = create<OrgState>((set, get) => ({
  organizations: [],
  current: null,
  loading: false,
  loaded: false,
  switching: false,
  error: null,

  async load() {
    if (!tokenStorage.get()) return;
    set({ loading: true, error: null });
    try {
      const [organizations, current] = await Promise.all([
        organizationsApi.list(),
        organizationsApi.current(),
      ]);
      set({ organizations, current, loading: false, loaded: true });
    } catch (err) {
      set({
        loading: false,
        loaded: true,
        error: apiErrorMessage(err, "Failed to load organizations"),
      });
    }
  },

  async switchTo(orgId) {
    if (get().current?.id === orgId) return;
    set({ switching: true, error: null });
    try {
      const token = await organizationsApi.switch(orgId);
      tokenStorage.set(token.access_token);
      // Hard reload: the active tenant changed, so all cached org-scoped data
      // (projects, reports, keywords, …) must be refetched from scratch.
      window.location.assign("/dashboard");
    } catch (err) {
      set({ switching: false, error: apiErrorMessage(err, "Failed to switch organization") });
      throw err;
    }
  },

  async createAndSwitch(name) {
    set({ switching: true, error: null });
    try {
      const org = await organizationsApi.create(name);
      const token = await organizationsApi.switch(org.id);
      tokenStorage.set(token.access_token);
      window.location.assign("/dashboard");
    } catch (err) {
      set({ switching: false, error: apiErrorMessage(err, "Failed to create organization") });
      throw err;
    }
  },

  reset() {
    set({
      organizations: [],
      current: null,
      error: null,
      loading: false,
      loaded: false,
      switching: false,
    });
  },
}));
