import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { aiApi, apiErrorMessage, outreachApi } from "../../api";
import Card from "../Card";
import { Badge, Button, Field, TextInput } from "../Field";
import type {
  Campaign,
  CampaignCreate,
  CampaignSendResponse,
  EmailAccount,
  EmailTemplate,
  FollowUpStep,
} from "../../types";

interface ProspectRow {
  id: number;
  domain: string;
  prospect_url: string;
  contact_email: string | null;
  status: string;
}

/**
 * Campaign management — list, create, send.
 *
 * Creation pulls approved prospects (from the existing backlinks queue) and
 * lets the user pick which to enroll, which account to send from, the
 * primary template, and an optional follow-up sequence.
 */
const CampaignsPanel = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<CampaignSendResponse | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await outreachApi.listCampaigns());
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load campaigns"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async (id: number) => {
    if (!confirm("Send the initial step of this campaign now?")) return;
    setSendingId(id);
    setLastResult(null);
    try {
      const result = await outreachApi.sendCampaign(id);
      setLastResult(result);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not send campaign"));
    } finally {
      setSendingId(null);
    }
  };

  const handlePause = async (id: number) => {
    try {
      await outreachApi.updateCampaign(id, { status: "paused" });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not pause"));
    }
  };

  const handleResume = async (id: number) => {
    try {
      await outreachApi.updateCampaign(id, { status: "draft" });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not resume"));
    }
  };

  return (
    <Card
      title="Campaigns"
      action={
        !showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            New campaign
          </Button>
        )
      }
    >
      {error && (
        <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {lastResult && (
        <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Batch finished — sent {lastResult.sent}, failed {lastResult.failed},
          skipped {lastResult.skipped}. Quota remaining today: {lastResult.quota_remaining}.
        </div>
      )}

      {showForm && (
        <CampaignForm
          onCancel={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await load();
          }}
          onError={setError}
        />
      )}

      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {!loading && campaigns.length === 0 && !showForm && (
        <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No campaigns yet. Create one to send to multiple prospects in a batch.
        </div>
      )}

      <ul className="space-y-2">
        {campaigns.map((c) => (
          <li key={c.id} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{c.name}</span>
                  <Badge
                    tone={
                      c.status === "completed"
                        ? "success"
                        : c.status === "sending"
                        ? "info"
                        : c.status === "paused"
                        ? "warn"
                        : "neutral"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Sent {c.sent_count} · Opened {c.opened_count} · Replied {c.replied_count} · Failed {c.failed_count}
                </div>
              </div>
              <div className="flex gap-2">
                {c.status === "draft" && (
                  <Button
                    variant="primary"
                    disabled={sendingId === c.id}
                    onClick={() => handleSend(c.id)}
                  >
                    {sendingId === c.id ? "Sending…" : "Send now"}
                  </Button>
                )}
                {c.status === "sending" && (
                  <Button variant="secondary" onClick={() => handlePause(c.id)}>
                    Pause
                  </Button>
                )}
                {c.status === "paused" && (
                  <Button variant="secondary" onClick={() => handleResume(c.id)}>
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Create-campaign form
// ---------------------------------------------------------------------------

interface CampaignFormProps {
  onCancel: () => void;
  onCreated: () => void;
  onError: (message: string) => void;
}

const CampaignForm = ({ onCancel, onCreated, onError }: CampaignFormProps) => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState<number | "">("");
  const [templateId, setTemplateId] = useState<number | "">("");
  const [fromEmail, setFromEmail] = useState("");
  const [trackOpens, setTrackOpens] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [followUps, setFollowUps] = useState<FollowUpStep[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [a, t, queue] = await Promise.all([
          outreachApi.listAccounts(),
          outreachApi.listTemplates(),
          aiApi.queueList("outreach", "approved"),
        ]);
        setAccounts(a);
        setTemplates(t);
        const items = (queue.items as unknown as ProspectRow[]) || [];
        setProspects(items.filter((p) => p.contact_email));
        if (a.length === 1) setAccountId(a[0].id);
        if (t.length === 1) setTemplateId(t[0].id);
      } catch (err) {
        onError(apiErrorMessage(err, "Could not load form data"));
      }
    })();
  }, [onError]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const senderOptions = selectedAccount
    ? [
        selectedAccount.email_address,
        ...selectedAccount.send_as
          .map((s) => s.email)
          .filter((e) => e && e !== selectedAccount.email_address),
      ]
    : [];

  const addFollowUp = () => {
    setFollowUps((prev) => [
      ...prev,
      {
        step_order: prev.length + 1,
        delay_days: 3 + prev.length * 2,
        template_id: templates[0]?.id ?? 0,
      },
    ]);
  };

  const removeFollowUp = (idx: number) => {
    setFollowUps((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, step_order: i + 1 }))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (typeof accountId !== "number" || typeof templateId !== "number") {
      onError("Pick an email account and template");
      return;
    }
    if (selected.size === 0) {
      onError("Select at least one prospect");
      return;
    }
    const validFollowUps = followUps.filter((s) => s.template_id > 0);
    setSubmitting(true);
    try {
      const payload: CampaignCreate = {
        name,
        email_account_id: accountId,
        template_id: templateId,
        from_email: fromEmail || undefined,
        track_opens: trackOpens,
        prospect_ids: Array.from(selected),
        follow_ups: validFollowUps,
      };
      await outreachApi.createCampaign(payload);
      onCreated();
    } catch (err) {
      onError(apiErrorMessage(err, "Could not create campaign"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-md border border-slate-200 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Campaign name">
          <TextInput
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Q3 resource page outreach"
          />
        </Field>
        <Field label="Send from account">
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : "")}
            required
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">— pick account —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.email_address} ({Math.max(a.daily_send_cap - a.sends_today, 0)} left today)
              </option>
            ))}
          </select>
        </Field>
        <Field label="Primary template">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}
            required
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">— pick template —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sender identity (optional)" hint="Defaults to the account's primary address.">
          <select
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            disabled={!selectedAccount}
          >
            <option value="">— default —</option>
            {senderOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={trackOpens}
          onChange={(e) => setTrackOpens(e.target.checked)}
        />
        Track opens with a tracking pixel
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium text-slate-700">
            Prospects ({selected.size} selected, {prospects.length} available)
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelected(new Set(prospects.map((p) => p.id)))}
            >
              Select all
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200">
          {prospects.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No approved prospects with contact emails yet. Use the Backlink Agent
              and approve prospects (with contact emails) first.
            </div>
          ) : (
            <ul>
              {prospects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-slate-900">{p.domain}</div>
                    <div className="text-xs text-slate-500">
                      {p.contact_email} · {p.prospect_url}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium text-slate-700">
            Follow-up sequence ({followUps.length} steps)
          </div>
          <Button type="button" variant="secondary" onClick={addFollowUp} disabled={templates.length === 0}>
            Add follow-up
          </Button>
        </div>
        {followUps.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 p-3 text-center text-xs text-slate-500">
            No follow-ups. Add one to send a reminder after N days if no reply.
          </div>
        ) : (
          <ul className="space-y-2">
            {followUps.map((s, idx) => (
              <li key={idx} className="flex items-center gap-2 rounded-md border border-slate-200 p-2">
                <span className="text-xs font-medium text-slate-500">Step {s.step_order}</span>
                <span className="text-xs text-slate-500">after</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={s.delay_days}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFollowUps((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, delay_days: v } : p))
                    );
                  }}
                  className="w-16 rounded-md border border-slate-200 px-2 py-1 text-sm"
                />
                <span className="text-xs text-slate-500">days using</span>
                <select
                  value={s.template_id}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFollowUps((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, template_id: v } : p))
                    );
                  }}
                  className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="ghost" onClick={() => removeFollowUp(idx)}>
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create campaign"}
        </Button>
      </div>
    </form>
  );
};

export default CampaignsPanel;
