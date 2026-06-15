import { apiClient } from "./client";
import type {
  GAConnection,
  GAPropertiesResponse,
  GAReportRequest,
  GAReportResponse,
  GoogleAuthUrl,
  GoogleOAuthCallbackPayload,
} from "../types";

/**
 * Google Analytics 4 API client. Endpoints live under `/analytics/*` and are
 * organization-scoped server-side.
 */
export const analyticsApi = {
  // ----- OAuth + connections ---------------------------------------------
  async getAuthUrl(redirectUri: string): Promise<GoogleAuthUrl> {
    const { data } = await apiClient.get<GoogleAuthUrl>("/analytics/google/auth-url", {
      params: { redirect_uri: redirectUri },
    });
    return data;
  },
  async completeAuth(payload: GoogleOAuthCallbackPayload): Promise<GAConnection> {
    const { data } = await apiClient.post<GAConnection>("/analytics/google/callback", payload);
    return data;
  },
  async listConnections(): Promise<GAConnection[]> {
    const { data } = await apiClient.get<GAConnection[]>("/analytics/connections");
    return data;
  },
  async disconnect(id: number): Promise<void> {
    await apiClient.delete(`/analytics/connections/${id}`);
  },

  // ----- Read operations -------------------------------------------------
  async listProperties(connectionId: number): Promise<GAPropertiesResponse> {
    const { data } = await apiClient.get<GAPropertiesResponse>(
      `/analytics/connections/${connectionId}/properties`
    );
    return data;
  },
  async report(payload: GAReportRequest): Promise<GAReportResponse> {
    const { data } = await apiClient.post<GAReportResponse>("/analytics/report", payload);
    return data;
  },
};
