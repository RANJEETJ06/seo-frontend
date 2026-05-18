import { apiClient } from "./client";
import type { CrawlRequest, CrawlResponse } from "../types";

export const crawlerApi = {
  async crawl(payload: CrawlRequest): Promise<CrawlResponse> {
    const { data } = await apiClient.post<CrawlResponse>(
      "/crawler/crawl",
      payload
    );
    return data;
  },
  async sitemap(
    url: string,
    max_urls = 200
  ): Promise<{ base_url: string; total: number; urls: string[] }> {
    const { data } = await apiClient.get("/crawler/sitemap", {
      params: { url, max_urls },
    });
    return data;
  },
  async robots(
    url: string
  ): Promise<{ base_url: string; found: boolean; content: string }> {
    const { data } = await apiClient.get("/crawler/robots", {
      params: { url },
    });
    return data;
  },
};
