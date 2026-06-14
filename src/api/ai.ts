import { apiClient } from "./client";
import type {
  AIRecommendationRequest,
  AIRecommendationResponse,
  AIVisibilityRequest,
  AIVisibilityResult,
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
  TaskStatusResponse,
} from "../types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * POST to an async (Celery-backed) endpoint that returns a task id, then poll
 * /tasks/{id} until it finishes and resolve with the result. This keeps the
 * public method signatures returning the final result, so callers don't need
 * to know the work now runs in the background. Mirrors useTaskPolling's logic.
 */
async function submitAndPoll<T>(
  url: string,
  body: unknown,
  opts: {
    params?: Record<string, unknown>;
    intervalMs?: number;
    maxTicks?: number;
  } = {}
): Promise<T> {
  const { params, intervalMs = 2000, maxTicks = 150 } = opts;
  const { data: submit } = await apiClient.post<{
    task_id: string;
    status: string;
  }>(url, body, params ? { params } : undefined);

  await sleep(500); // small head-start so the task is enqueued before first poll
  for (let tick = 0; tick < maxTicks; tick++) {
    const { data: status } = await apiClient.get<TaskStatusResponse<T>>(
      `/tasks/${submit.task_id}`
    );
    if (status.status === "SUCCESS") return status.result as T;
    if (status.status === "FAILURE" || status.status === "REVOKED") {
      throw new Error(status.error || "Task failed");
    }
    await sleep(intervalMs);
  }
  throw new Error("Timed out waiting for task to complete.");
}

export const aiApi = {
  async aiVisibility(
    payload: AIVisibilityRequest
  ): Promise<AIVisibilityResult> {
    const { data } = await apiClient.post<AIVisibilityResult>(
      "/ai-visibility/sync",
      payload
    );
    return data;
  },
  async submitAIVisibility(
    payload: AIVisibilityRequest
  ): Promise<{ task_id: string; status: string }> {
    const { data } = await apiClient.post<{ task_id: string; status: string }>(
      "/ai-visibility",
      payload
    );
    return data;
  },
  async recommend(
    payload: AIRecommendationRequest
  ): Promise<AIRecommendationResponse> {
    const { data } = await apiClient.post<AIRecommendationResponse>(
      "/ai/recommend",
      payload
    );
    return data;
  },
  // These run in the background (crawl + LLM heavy): submit → poll → result.
  async backlinks(
    payload: BacklinkAgentRequest
  ): Promise<BacklinkAgentResponse> {
    return submitAndPoll<BacklinkAgentResponse>("/ai/backlinks", payload);
  },
  async internalExport(
    payload: InternalExportRequest
  ): Promise<InternalExportResponse> {
    return submitAndPoll<InternalExportResponse>(
      "/ai/backlinks/internal-export",
      payload
    );
  },
  async discoverProspects(
    payload: ProspectDiscoveryRequest
  ): Promise<BacklinkAgentResponse> {
    return submitAndPoll<BacklinkAgentResponse>(
      "/ai/backlinks/discover",
      payload
    );
  },
  async brokenLinks(
    payload: BrokenLinkScanRequest
  ): Promise<BrokenLinkScanResponse> {
    return submitAndPoll<BrokenLinkScanResponse>(
      "/ai/backlinks/broken-links",
      payload
    );
  },
  async guestPost(payload: GuestPostRequest): Promise<GuestPostResponse> {
    return submitAndPoll<GuestPostResponse>("/ai/backlinks/guest-post", payload);
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
    return submitAndPoll<{ url: string; chunks: number }>(
      "/ai/rag/ingest",
      null,
      { params: { url } }
    );
  },
  async ragAsk(payload: RAGQuery): Promise<RAGResponse> {
    const { data } = await apiClient.post<RAGResponse>("/ai/rag/ask", payload);
    return data;
  },
};
