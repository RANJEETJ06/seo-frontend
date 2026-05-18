import { create } from "zustand";
import { authApi, tokenStorage, apiErrorMessage } from "../api";
import type { LoginPayload, RegisterPayload, User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
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
  loading: false,
  initialized: false,
  error: null,

  async login(payload) {
    set({ loading: true, error: null });
    try {
      const token = await authApi.login(payload);
      tokenStorage.set(token.access_token);
      const user = await authApi.me();
      set({ user, token: token.access_token, loading: false });
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
      set({ user, token: token.access_token, loading: false });
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
    } catch {
      tokenStorage.clear();
      set({ user: null, token: null, initialized: true });
    }
  },

  logout() {
    tokenStorage.clear();
    set({ user: null, token: null });
  },
}));
