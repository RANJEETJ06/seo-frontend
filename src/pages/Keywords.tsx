import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { keywordsApi, apiErrorMessage } from "../api";
import { useProjectsStore } from "../store/projects";
import Card from "../components/Card";
import { Field, TextInput, TextArea, Button, Badge } from "../components/Field";
import type {
  KeywordBase,
  KeywordCluster as KeywordClusterT,
  KeywordRead,
} from "../types";

type SourceMode = "url" | "text";
type Tab = "extract" | "project";

const Keywords = () => {
  const [tab, setTab] = useState<Tab>("extract");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Keywords</h1>
        <p className="mt-1 text-sm text-slate-500">
          Extract and cluster keywords, or browse keywords saved per project.
        </p>
      </div>

      <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
        {(
          [
            { id: "extract", label: "Extract & cluster" },
            { id: "project", label: "Project keywords" },
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

      {tab === "extract" ? <ExtractPanel /> : <ProjectKeywordsPanel />}
    </div>
  );
};

const ExtractPanel = () => {
  const [mode, setMode] = useState<SourceMode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [topN, setTopN] = useState(20);
  const [minLength, setMinLength] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<KeywordBase[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [clusterCount, setClusterCount] = useState(5);
  const [clustering, setClustering] = useState(false);
  const [clusters, setClusters] = useState<KeywordClusterT[]>([]);

  const handleExtract = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setClusters([]);
    try {
      const res = await keywordsApi.extract({
        url: mode === "url" ? url : undefined,
        text: mode === "text" ? text : undefined,
        top_n: topN,
        min_length: minLength,
      });
      setKeywords(res.keywords);
      setSourceUrl(res.source_url ?? null);
    } catch (err) {
      setError(apiErrorMessage(err, "Extraction failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCluster = async () => {
    if (keywords.length < 2) return;
    setClustering(true);
    try {
      const res = await keywordsApi.cluster({
        keywords: keywords.map((k) => k.term),
        n_clusters: Math.min(clusterCount, keywords.length),
      });
      setClusters(res.clusters);
    } catch (err) {
      setError(apiErrorMessage(err, "Clustering failed"));
    } finally {
      setClustering(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 inline-flex rounded-md border border-slate-200 p-1">
          {(["url", "text"] as SourceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {m === "url" ? "From URL" : "From text"}
            </button>
          ))}
        </div>

        <form onSubmit={handleExtract} className="grid gap-4 md:grid-cols-3">
          {mode === "url" ? (
            <div className="md:col-span-3">
              <Field label="URL">
                <TextInput
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                />
              </Field>
            </div>
          ) : (
            <div className="md:col-span-3">
              <Field label="Text">
                <TextArea
                  rows={6}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste content to extract keywords from…"
                />
              </Field>
            </div>
          )}
          <Field label="Top N">
            <TextInput
              type="number"
              min={1}
              max={200}
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
            />
          </Field>
          <Field label="Min length">
            <TextInput
              type="number"
              min={1}
              max={20}
              value={minLength}
              onChange={(e) => setMinLength(Number(e.target.value))}
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Extracting…" : "Extract keywords"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </form>
      </Card>

      {keywords.length > 0 && (
        <Card
          title={`Keywords (${keywords.length})`}
          action={
            sourceUrl ? (
              <Badge tone="neutral">
                <span className="truncate max-w-[300px]">{sourceUrl}</span>
              </Badge>
            ) : null
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-2 py-2">Term</th>
                  <th className="px-2 py-2">Frequency</th>
                  <th className="px-2 py-2">Density</th>
                  <th className="px-2 py-2">Relevance</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-2 py-2 font-medium text-slate-700">
                      {k.term}
                    </td>
                    <td className="px-2 py-2 text-slate-600">{k.frequency}</td>
                    <td className="px-2 py-2 text-slate-600">
                      {(k.density * 100).toFixed(2)}%
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {k.relevance_score.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-end gap-3 border-t border-slate-100 pt-4">
            <Field label="Number of clusters">
              <TextInput
                type="number"
                min={2}
                max={50}
                value={clusterCount}
                onChange={(e) => setClusterCount(Number(e.target.value))}
                className="w-32"
              />
            </Field>
            <Button
              variant="secondary"
              onClick={handleCluster}
              disabled={clustering || keywords.length < 2}
            >
              {clustering ? "Clustering…" : "Cluster keywords"}
            </Button>
          </div>
        </Card>
      )}

      {clusters.length > 0 && (
        <Card title={`Clusters (${clusters.length})`}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clusters.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">
                    {c.label}
                  </div>
                  {c.centroid_term && (
                    <Badge tone="info">★ {c.centroid_term}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.members.map((m, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const ProjectKeywordsPanel = () => {
  const { items: projects, fetch: fetchProjects } = useProjectsStore();
  const [projectId, setProjectId] = useState("");
  const [keywords, setKeywords] = useState<KeywordRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!projectId) {
      setKeywords([]);
      return;
    }
    setLoading(true);
    setError(null);
    keywordsApi
      .listForProject(Number(projectId))
      .then(setKeywords)
      .catch((err) =>
        setError(apiErrorMessage(err, "Failed to load keywords"))
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  const clusters = new Map<string, KeywordRead[]>();
  for (const k of keywords) {
    const key = k.cluster_label ?? "Uncategorized";
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(k);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="max-w-md">
          <Field label="Project">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.domain})
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {loading && (
        <Card>
          <div className="py-8 text-center text-sm text-slate-500">
            Loading keywords…
          </div>
        </Card>
      )}

      {error && (
        <Card>
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        </Card>
      )}

      {projectId && !loading && !error && keywords.length === 0 && (
        <Card>
          <div className="py-12 text-center text-sm text-slate-500">
            No keywords saved for this project yet.
          </div>
        </Card>
      )}

      {keywords.length > 0 && (
        <Card
          title={`Saved keywords (${keywords.length})`}
          action={
            <Badge tone="info">
              {clusters.size} cluster{clusters.size === 1 ? "" : "s"}
            </Badge>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-2 py-2">Term</th>
                  <th className="px-2 py-2">Cluster</th>
                  <th className="px-2 py-2">Frequency</th>
                  <th className="px-2 py-2">Density</th>
                  <th className="px-2 py-2">Relevance</th>
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2">Added</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k) => (
                  <tr key={k.id} className="border-t border-slate-100">
                    <td className="px-2 py-2 font-medium text-slate-700">
                      {k.term}
                    </td>
                    <td className="px-2 py-2">
                      {k.cluster_label ? (
                        <Badge tone="neutral">{k.cluster_label}</Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {k.frequency}
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {(k.density * 100).toFixed(2)}%
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {k.relevance_score.toFixed(2)}
                    </td>
                    <td className="px-2 py-2">
                      <Badge tone="neutral">{k.source}</Badge>
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-500">
                      {new Date(k.created_at).toLocaleDateString()}
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

export default Keywords;
