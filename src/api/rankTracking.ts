import { apiClient } from "./client";
import type {
  CaptureResponse,
  RankSummaryResponse,
  RankTarget,
  RankTargetCreate,
} from "../types";

/**
 * Rank tracking API client. Endpoints live under `/rank-tracking/*` and are
 * organization-scoped server-side (via the project + GSC connection).
 */
export const rankTrackingApi = {
  async listTargets(projectId: number): Promise<RankTarget[]> {
    const { data } = await apiClient.get<RankTarget[]>("/rank-tracking/targets", {
      params: { project_id: projectId },
    });
    return data;
  },
  async createTarget(payload: RankTargetCreate): Promise<RankTarget> {
    const { data } = await apiClient.post<RankTarget>("/rank-tracking/targets", payload);
    return data;
  },
  async deleteTarget(id: number): Promise<void> {
    await apiClient.delete(`/rank-tracking/targets/${id}`);
  },
  async capture(targetId: number): Promise<CaptureResponse> {
    const { data } = await apiClient.post<CaptureResponse>("/rank-tracking/capture", {
      target_id: targetId,
    });
    return data;
  },
  async summary(projectId: number): Promise<RankSummaryResponse> {
    const { data } = await apiClient.get<RankSummaryResponse>("/rank-tracking/summary", {
      params: { project_id: projectId },
    });
    return data;
  },
};
