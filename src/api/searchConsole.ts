import { apiClient } from "./client";
import type {
  GoogleAuthUrl,
  GoogleOAuthCallbackPayload,
  GSCConnection,
  GSCImportRequest,
  GSCImportResponse,
  GSCPerformanceRequest,
  GSCPerformanceResponse,
  GSCSitesResponse,
} from "../types";

/**
 * Google Search Console API client. All endpoints live under
 * `/search-console/*` and are organization-scoped server-side.
 */
export const searchConsoleApi = {
  // ----- OAuth + connections ---------------------------------------------
  async getAuthUrl(redirectUri: string): Promise<GoogleAuthUrl> {
    const { data } = await apiClient.get<GoogleAuthUrl>("/search-console/google/auth-url", {
      params: { redirect_uri: redirectUri },
    });
    return data;
  },
  async completeAuth(payload: GoogleOAuthCallbackPayload): Promise<GSCConnection> {
    const { data } = await apiClient.post<GSCConnection>("/search-console/google/callback", payload);
    return data;
  },
  async listConnections(): Promise<GSCConnection[]> {
    const { data } = await apiClient.get<GSCConnection[]>("/search-console/connections");
    return data;
  },
  async disconnect(id: number): Promise<void> {
    await apiClient.delete(`/search-console/connections/${id}`);
  },

  // ----- Read operations -------------------------------------------------
  async listSites(connectionId: number): Promise<GSCSitesResponse> {
    const { data } = await apiClient.get<GSCSitesResponse>(
      `/search-console/connections/${connectionId}/sites`
    );
    return data;
  },
  async performance(payload: GSCPerformanceRequest): Promise<GSCPerformanceResponse> {
    const { data } = await apiClient.post<GSCPerformanceResponse>(
      "/search-console/performance",
      payload
    );
    return data;
  },
  async importKeywords(payload: GSCImportRequest): Promise<GSCImportResponse> {
    const { data } = await apiClient.post<GSCImportResponse>(
      "/search-console/import-keywords",
      payload
    );
    return data;
  },
};
