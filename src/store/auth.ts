import { create } from "zustand";
import { authApi, tokenStorage, apiErrorMessage } from "../api";
import { useOrgStore } from "./org";
import type { LoginPayload, RegisterPayload, User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  /** Active organization the current token is scoped to (the tenant). */
  activeOrgId: number | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: tokenStorage.get(),
  activeOrgId: null,
  loading: false,
  initialized: false,
  error: null,

  async login(payload) {
    set({ loading: true, error: null });
    try {
      const token = await authApi.login(payload);
      tokenStorage.set(token.access_token);
      const user = await authApi.me();
      set({
        user,
        token: token.access_token,
        activeOrgId: token.organization_id ?? null,
        loading: false,
      });
      void useOrgStore.getState().load();
    } catch (err) {
      set({ loading: false, error: apiErrorMessage(err, "Login failed") });
      throw err;
    }
  },

  async register(payload) {
    set({ loading: true, error: null });
    try {
      await authApi.register(payload);
      const token = await authApi.login({
        email: payload.email,
        password: payload.password,
      });
      tokenStorage.set(token.access_token);
      const user = await authApi.me();
      set({
        user,
        token: token.access_token,
        activeOrgId: token.organization_id ?? null,
        loading: false,
      });
      void useOrgStore.getState().load();
    } catch (err) {
      set({
        loading: false,
        error: apiErrorMessage(err, "Registration failed"),
      });
      throw err;
    }
  },

  async loadCurrentUser() {
    const token = tokenStorage.get();
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, token, initialized: true });
      void useOrgStore.getState().load();
    } catch {
      tokenStorage.clear();
      set({ user: null, token: null, activeOrgId: null, initialized: true });
    }
  },

  logout() {
    tokenStorage.clear();
    useOrgStore.getState().reset();
    set({ user: null, token: null, activeOrgId: null });
  },
}));
