import { apiClient } from "./client";
import type {
  AnalyzeRequest,
  SEOAnalysisResult,
  SEOReport,
  CompetitorRequest,
  CompetitorReport,
  TaskSubmitResponse,
  TaskStatusResponse,
} from "../types";

export const seoApi = {
  /** Enqueue analysis on the Celery worker. Poll getTaskStatus(task_id) until SUCCESS. */
  async submitAnalysis(payload: AnalyzeRequest): Promise<TaskSubmitResponse> {
    const { data } = await apiClient.post<TaskSubmitResponse>(
      "/analyze",
      payload
    );
    return data;
  },
  /** Synchronous fallback — only for quick pages (subject to client timeout). */
  async analyzeSync(payload: AnalyzeRequest): Promise<SEOAnalysisResult> {
    const { data } = await apiClient.post<SEOAnalysisResult>(
      "/analyze/sync",
      payload
    );
    return data;
  },
  async getTaskStatus<T = Record<string, unknown>>(
    taskId: string
  ): Promise<TaskStatusResponse<T>> {
    const { data } = await apiClient.get<TaskStatusResponse<T>>(
      `/tasks/${taskId}`
    );
    return data;
  },
  async cancelTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },
  async listReports(projectId: number, limit = 50): Promise<SEOReport[]> {
    const { data } = await apiClient.get<SEOReport[]>(
      `/projects/${projectId}/reports`,
      { params: { limit } }
    );
    return data;
  },
  async getReport(reportId: number): Promise<SEOReport> {
    const { data } = await apiClient.get<SEOReport>(`/reports/${reportId}`);
    return data;
  },
  async submitCompetitor(payload: CompetitorRequest): Promise<TaskSubmitResponse> {
    const { data } = await apiClient.post<TaskSubmitResponse>(
      "/competitor",
      payload
    );
    return data;
  },
  async competitorSync(payload: CompetitorRequest): Promise<CompetitorReport> {
    const { data } = await apiClient.post<CompetitorReport>(
      "/competitor/sync",
      payload
    );
    return data;
  },
};
