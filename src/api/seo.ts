import { apiClient } from "./client";
import type {
  AnalyzeRequest,
  SEOAnalysisResult,
  SEOReport,
  CompetitorRequest,
  CompetitorReport,
  TaskSubmitResponse,
  TaskStatusResponse,
  TechAuditRequest,
  TechAuditResponse,
  AIVisibilityRequest,
  AIVisibilityResult,
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
  /** Core Web Vitals + structured-data audit (synchronous, heuristic-only). */
  async techAudit(payload: TechAuditRequest): Promise<TechAuditResponse> {
    const { data } = await apiClient.post<TechAuditResponse>(
      "/tech-audit/sync",
      payload
    );
    return data;
  },
  /** Enqueue tech audit on Celery (recommended when PSI is enabled). */
  async submitTechAudit(payload: TechAuditRequest): Promise<TaskSubmitResponse> {
    const { data } = await apiClient.post<TaskSubmitResponse>(
      "/tech-audit",
      payload
    );
    return data;
  },
  /** AI Visibility (GEO + AEO + PAA) — synchronous. */
  async aiVisibility(payload: AIVisibilityRequest): Promise<AIVisibilityResult> {
    const { data } = await apiClient.post<AIVisibilityResult>(
      "/ai-visibility/sync",
      payload
    );
    return data;
  },
  /** Enqueue AI Visibility on Celery (recommended when Gemini is enabled). */
  async submitAIVisibility(
    payload: AIVisibilityRequest
  ): Promise<TaskSubmitResponse> {
    const { data } = await apiClient.post<TaskSubmitResponse>(
      "/ai-visibility",
      payload
    );
    return data;
  },
};
