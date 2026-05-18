import { apiClient } from "./client";
import type {
  LoginPayload,
  RegisterPayload,
  Token,
  User,
} from "../types";

export const authApi = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/register", payload);
    return data;
  },
  async login(payload: LoginPayload): Promise<Token> {
    const { data } = await apiClient.post<Token>("/auth/login/json", payload);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
