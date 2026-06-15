import { apiClient } from "./client";
import type {
  GeneratedReport,
  GeneratedReportList,
  ReportGenerateRequest,
} from "../types";

/**
 * White-label report API client. Endpoints live under `/reports/*` and are
 * organization-scoped server-side (via the project).
 */
export const reportsApi = {
  async generate(payload: ReportGenerateRequest): Promise<GeneratedReport> {
    const { data } = await apiClient.post<GeneratedReport>("/reports/generate", payload);
    return data;
  },
  async list(projectId: number): Promise<GeneratedReportList> {
    const { data } = await apiClient.get<GeneratedReportList>("/reports", {
      params: { project_id: projectId },
    });
    return data;
  },
  async get(id: number): Promise<GeneratedReport> {
    const { data } = await apiClient.get<GeneratedReport>(`/reports/${id}`);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  },
  /** Fetch the PDF as a blob (auth header is applied by the shared client). */
  async downloadPdf(id: number): Promise<Blob> {
    const { data } = await apiClient.get(`/reports/${id}/pdf`, {
      responseType: "blob",
    });
    return data as Blob;
  },
};
