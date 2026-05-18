import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useProjectsStore } from "../store/projects";
import Card from "../components/Card";
import { Field, TextInput, TextArea, Button, Badge } from "../components/Field";
import { apiErrorMessage } from "../api";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const { items, loading, error, fetch, create, update, remove } = useProjectsStore();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editId) {
        await update(editId, {
          name: name || undefined,
          description: description || undefined,
        });
        setEditId(null);
      } else {
        await create({ name, domain, description: description || undefined });
      }
      setName("");
      setDomain("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setSubmitError(
        apiErrorMessage(err, `Could not ${editId ? "update" : "create"} project`)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p: typeof items[0]) => {
    setEditId(p.id);
    setName(p.name);
    setDomain(p.domain);
    setDescription(p.description || "");
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditId(null);
    setName("");
    setDomain("");
    setDescription("");
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project? Its reports will also be removed.")) return;
    try {
      await remove(id);
    } catch (err) {
      alert(apiErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your SEO projects and run new analyses.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New project"}
        </Button>
      </div>

      {showForm && (
        <Card title={editId ? "Edit project" : "Create project"}>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <TextInput
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My company website"
              />
            </Field>
            {!editId && (
              <Field label="Domain">
                <TextInput
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                />
              </Field>
            )}
            <div className={editId ? "md:col-span-2" : ""}>
              <Field label="Description (optional)">
                <TextArea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </div>
            {submitError && (
              <div className="md:col-span-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Please wait…"
                  : editId
                    ? "Save changes"
                    : "Create project"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`Projects (${items.length})`}>
        {loading && (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading projects…
          </div>
        )}
        {error && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-sm font-medium text-slate-700">
              No projects yet
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Create your first project to start tracking SEO reports.
            </div>
          </div>
        )}
        {items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {p.name}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">
                      {p.domain}
                    </div>
                  </div>
                  <Badge tone="info">#{p.id}</Badge>
                </div>
                {p.description && (
                  <div className="mt-3 line-clamp-2 text-xs text-slate-600">
                    {p.description}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/reports?project=${p.id}`}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Reports
                  </Link>
                  <Link
                    to={`/analyze?project=${p.id}`}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Analyze
                  </Link>
                  <button
                    onClick={() => startEdit(p)}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="ml-auto text-xs text-rose-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
