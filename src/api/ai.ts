import { apiClient } from "./client";
import type {
  AIRecommendationRequest,
  AIRecommendationResponse,
  BacklinkAgentRequest,
  BacklinkAgentResponse,
  InternalExportRequest,
  InternalExportResponse,
  ProspectDiscoveryRequest,
  BrokenLinkScanRequest,
  BrokenLinkScanResponse,
  GuestPostRequest,
  GuestPostResponse,
  DirectoryQueueRequest,
  DirectoryQueueResponse,
  QueueListResponse,
  RAGQuery,
  RAGResponse,
} from "../types";

export const aiApi = {
  async recommend(
    payload: AIRecommendationRequest
  ): Promise<AIRecommendationResponse> {
    const { data } = await apiClient.post<AIRecommendationResponse>(
      "/ai/recommend",
      payload
    );
    return data;
  },
  async backlinks(
    payload: BacklinkAgentRequest
  ): Promise<BacklinkAgentResponse> {
    const { data } = await apiClient.post<BacklinkAgentResponse>(
      "/ai/backlinks",
      payload
    );
    return data;
  },
  async internalExport(
    payload: InternalExportRequest
  ): Promise<InternalExportResponse> {
    const { data } = await apiClient.post<InternalExportResponse>(
      "/ai/backlinks/internal-export",
      payload
    );
    return data;
  },
  async discoverProspects(
    payload: ProspectDiscoveryRequest
  ): Promise<BacklinkAgentResponse> {
    const { data } = await apiClient.post<BacklinkAgentResponse>(
      "/ai/backlinks/discover",
      payload
    );
    return data;
  },
  async brokenLinks(
    payload: BrokenLinkScanRequest
  ): Promise<BrokenLinkScanResponse> {
    const { data } = await apiClient.post<BrokenLinkScanResponse>(
      "/ai/backlinks/broken-links",
      payload
    );
    return data;
  },
  async guestPost(payload: GuestPostRequest): Promise<GuestPostResponse> {
    const { data } = await apiClient.post<GuestPostResponse>(
      "/ai/backlinks/guest-post",
      payload
    );
    return data;
  },
  async directories(
    payload: DirectoryQueueRequest
  ): Promise<DirectoryQueueResponse> {
    const { data } = await apiClient.post<DirectoryQueueResponse>(
      "/ai/backlinks/directories",
      payload
    );
    return data;
  },
  async queueList(
    kind: "outreach" | "directory" | "guestpost",
    status?: string
  ): Promise<QueueListResponse> {
    const { data } = await apiClient.get<QueueListResponse>(
      "/ai/backlinks/queue",
      { params: { kind, status } }
    );
    return data;
  },
  async queueUpdate(
    kind: string,
    rowId: number,
    status: string
  ): Promise<{ id: number; kind: string; status: string }> {
    const { data } = await apiClient.patch(
      `/ai/backlinks/queue/${kind}/${rowId}`,
      { status }
    );
    return data;
  },
  async ragIngest(url: string): Promise<{ url: string; chunks: number }> {
    const { data } = await apiClient.post("/ai/rag/ingest", null, {
      params: { url },
    });
    return data;
  },
  async ragAsk(payload: RAGQuery): Promise<RAGResponse> {
    const { data } = await apiClient.post<RAGResponse>("/ai/rag/ask", payload);
    return data;
  },
};
