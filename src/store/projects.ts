import { create } from "zustand";
import { projectsApi, apiErrorMessage } from "../api";
import type { Project, ProjectCreate, ProjectUpdate } from "../types";

interface ProjectsState {
  items: Project[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (payload: ProjectCreate) => Promise<Project>;
  update: (id: number, payload: ProjectUpdate) => Promise<Project>;
  remove: (id: number) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  async fetch() {
    set({ loading: true, error: null });
    try {
      const items = await projectsApi.list();
      set({ items, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: apiErrorMessage(err, "Failed to load projects"),
      });
    }
  },

  async create(payload) {
    const project = await projectsApi.create(payload);
    set({ items: [project, ...get().items] });
    return project;
  },

  async update(id, payload) {
    const updated = await projectsApi.update(id, payload);
    set({
      items: get().items.map((p) => (p.id === id ? updated : p)),
    });
    return updated;
  },

  async remove(id) {
    await projectsApi.remove(id);
    set({ items: get().items.filter((p) => p.id !== id) });
  },
}));
