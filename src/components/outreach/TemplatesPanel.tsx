import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiErrorMessage, outreachApi } from "../../api";
import Card from "../Card";
import { Badge, Button, Field, TextArea, TextInput } from "../Field";
import type { EmailTemplate, EmailTemplateCreate } from "../../types";

const CATEGORIES = ["outreach", "follow_up", "broken_link", "guest_post", "custom"] as const;
type Category = (typeof CATEGORIES)[number];

const BLANK_TEMPLATE: EmailTemplateCreate = {
  name: "",
  subject: "",
  body_text: "",
  category: "outreach",
  is_default: false,
};

/**
 * Email template CRUD with live variable preview.
 *
 * Templates use `{{first_name}}` style variables; the help text exposes the
 * standard names that get bound when rendering against a prospect.
 */
const TemplatesPanel = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [draft, setDraft] = useState<EmailTemplateCreate>(BLANK_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await outreachApi.listTemplates());
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load templates"));
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setEditing(null);
    setDraft(BLANK_TEMPLATE);
    setShowForm(true);
  };

  const startEdit = (t: EmailTemplate) => {
    setEditing(t);
    setDraft({
      name: t.name,
      subject: t.subject,
      body_text: t.body_text,
      body_html: t.body_html ?? undefined,
      category: t.category,
      is_default: t.is_default,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await outreachApi.updateTemplate(editing.id, draft);
      } else {
        await outreachApi.createTemplate(draft);
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save template"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template? Campaigns using it will keep their copy.")) return;
    try {
      await outreachApi.deleteTemplate(id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete template"));
    }
  };

  return (
    <Card
      title="Outreach templates"
      action={
        !showForm && (
          <Button variant="primary" onClick={startNew}>
            New template
          </Button>
        )
      }
    >
      {error && (
        <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-md border border-slate-200 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <TextInput
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Friendly internal name"
              />
            </Field>
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Subject" hint="Use {{first_name}}, {{domain}}, etc.">
            <TextInput
              required
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              placeholder="Quick suggestion for {{domain}}"
            />
          </Field>
          <Field
            label="Body (plain text)"
            hint="Variables: first_name, contact_name, domain, prospect_url, target_url, sender_name"
          >
            <TextArea
              required
              rows={10}
              value={draft.body_text}
              onChange={(e) => setDraft({ ...draft, body_text: e.target.value })}
              placeholder={"Hi {{first_name}},\n\nI noticed your post about ..."}
            />
          </Field>
          <Field label="Body (HTML, optional)" hint="If provided, sent as multipart/alternative.">
            <TextArea
              rows={6}
              value={draft.body_html ?? ""}
              onChange={(e) => setDraft({ ...draft, body_html: e.target.value || undefined })}
              placeholder="<p>Hi {{first_name}},</p>"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.is_default ?? false}
              onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })}
            />
            Set as default template for this category
          </label>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update template" : "Create template"}
            </Button>
          </div>
        </form>
      )}

      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {!loading && templates.length === 0 && !showForm && (
        <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No templates yet. Create one to use across campaigns and bulk sends.
        </div>
      )}

      <ul className="space-y-2">
        {templates.map((t) => (
          <li
            key={t.id}
            className="rounded-md border border-slate-200 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{t.name}</span>
                  <Badge tone="neutral">{t.category}</Badge>
                  {t.is_default && <Badge tone="info">default</Badge>}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Subject: {t.subject}
                </div>
                {t.variables.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.variables.map((v) => (
                      <Badge key={v} tone="neutral">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => startEdit(t)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(t.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TemplatesPanel;
