import { apiClient } from "./client";
import type { Project, ProjectCreate, ProjectUpdate } from "../types";

export const projectsApi = {
  async list(skip = 0, limit = 100): Promise<Project[]> {
    const { data } = await apiClient.get<Project[]>("/projects", {
      params: { skip, limit },
    });
    return data;
  },
  async get(id: number): Promise<Project> {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },
  async create(payload: ProjectCreate): Promise<Project> {
    const { data } = await apiClient.post<Project>("/projects", payload);
    return data;
  },
  async update(id: number, payload: ProjectUpdate): Promise<Project> {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
