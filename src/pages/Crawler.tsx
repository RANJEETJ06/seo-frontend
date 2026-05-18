import { useState } from "react";
import type { FormEvent } from "react";
import { crawlerApi, apiErrorMessage } from "../api";
import Card from "../components/Card";
import { Field, TextInput, Button, Badge } from "../components/Field";
import type { CrawlResponse } from "../types";

type Tab = "crawl" | "sitemap" | "robots";

const Crawler = () => {
  const [tab, setTab] = useState<Tab>("crawl");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Crawler</h1>
        <p className="mt-1 text-sm text-slate-500">
          Crawl a site, inspect its sitemap, and read its robots.txt.
        </p>
      </div>

      <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
        {(
          [
            { id: "crawl", label: "Crawl" },
            { id: "sitemap", label: "Sitemap" },
            { id: "robots", label: "Robots.txt" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded px-4 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "crawl" && <CrawlPanel />}
      {tab === "sitemap" && <SitemapPanel />}
      {tab === "robots" && <RobotsPanel />}
    </div>
  );
};

const CrawlPanel = () => {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(10);
  const [sameDomainOnly, setSameDomainOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CrawlResponse | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await crawlerApi.crawl({
        url: url.trim(),
        max_pages: maxPages,
        same_domain_only: sameDomainOnly,
      });
      setResult(res);
    } catch (err) {
      setError(apiErrorMessage(err, "Crawl failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <Field label="Seed URL">
              <TextInput
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          </div>
          <Field label="Max pages" hint="1 – 500">
            <TextInput
              type="number"
              min={1}
              max={500}
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
            />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={sameDomainOnly}
                onChange={(e) => setSameDomainOnly(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Same domain only
            </label>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Crawling…" : "Start crawl"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <Card
          title={`Pages (${result.total_pages})`}
          action={<Badge tone="info">Seed: {result.seed}</Badge>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-2 py-2">URL</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Words</th>
                  <th className="px-2 py-2">Fetched</th>
                </tr>
              </thead>
              <tbody>
                {result.pages.map((p, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="max-w-md truncate px-2 py-2 text-slate-700">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-indigo-600 hover:underline"
                      >
                        {p.url}
                      </a>
                    </td>
                    <td className="px-2 py-2">
                      <Badge
                        tone={
                          p.status_code >= 200 && p.status_code < 300
                            ? "success"
                            : p.status_code >= 300 && p.status_code < 400
                              ? "warn"
                              : "danger"
                        }
                      >
                        {p.status_code}
                      </Badge>
                    </td>
                    <td className="max-w-xs truncate px-2 py-2 text-slate-600">
                      {p.title ?? "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {p.word_count}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-500">
                      {new Date(p.fetched_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

const SitemapPanel = () => {
  const [url, setUrl] = useState("");
  const [maxUrls, setMaxUrls] = useState(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    base_url: string;
    total: number;
    urls: string[];
  } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await crawlerApi.sitemap(url.trim(), maxUrls);
      setResult(res);
    } catch (err) {
      setError(apiErrorMessage(err, "Sitemap lookup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Field label="Base URL">
              <TextInput
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          </div>
          <Field label="Max URLs" hint="1 – 5000">
            <TextInput
              type="number"
              min={1}
              max={5000}
              value={maxUrls}
              onChange={(e) => setMaxUrls(Number(e.target.value))}
            />
          </Field>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Fetching…" : "Discover URLs"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </form>
      </Card>

      {result && (
        <Card title={`URLs (${result.total})`}>
          <ul className="max-h-[480px] space-y-1 overflow-y-auto text-sm">
            {result.urls.map((u, i) => (
              <li
                key={i}
                className="truncate rounded px-2 py-1 text-slate-700 hover:bg-slate-50"
              >
                <a
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 hover:underline"
                >
                  {u}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

const RobotsPanel = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    base_url: string;
    found: boolean;
    content: string;
  } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await crawlerApi.robots(url.trim());
      setResult(res);
    } catch (err) {
      setError(apiErrorMessage(err, "robots.txt lookup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Field label="Base URL">
              <TextInput
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Fetching…" : "Fetch robots.txt"}
          </Button>
        </form>
        {error && (
          <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card
          title={result.base_url}
          action={
            <Badge tone={result.found ? "success" : "danger"}>
              {result.found ? "Found" : "Not found"}
            </Badge>
          }
        >
          {result.content ? (
            <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
              {result.content}
            </pre>
          ) : (
            <div className="text-sm text-slate-500">No content.</div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Crawler;
