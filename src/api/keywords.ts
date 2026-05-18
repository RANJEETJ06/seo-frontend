import { apiClient } from "./client";
import type {
  KeywordExtractRequest,
  KeywordExtractResponse,
  KeywordClusterRequest,
  KeywordClusterResponse,
  KeywordRead,
} from "../types";

export const keywordsApi = {
  async extract(
    payload: KeywordExtractRequest
  ): Promise<KeywordExtractResponse> {
    const { data } = await apiClient.post<KeywordExtractResponse>(
      "/keywords/extract",
      payload
    );
    return data;
  },
  async cluster(
    payload: KeywordClusterRequest
  ): Promise<KeywordClusterResponse> {
    const { data } = await apiClient.post<KeywordClusterResponse>(
      "/keywords/cluster",
      payload
    );
    return data;
  },
  async listForProject(projectId: number, limit = 200): Promise<KeywordRead[]> {
    const { data } = await apiClient.get<KeywordRead[]>(
      `/keywords/projects/${projectId}`,
      { params: { limit } }
    );
    return data;
  },
};
