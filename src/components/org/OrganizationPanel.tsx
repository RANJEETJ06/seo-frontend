import { useCallback, useEffect, useState } from "react";
import {
  apiErrorMessage,
  canManageOrg,
  organizationsApi,
} from "../../api";
import { useOrgStore } from "../../store/org";
import { useAuthStore } from "../../store/auth";
import Card from "../Card";
import { Badge, Button, Field, TextInput } from "../Field";
import type { OrgInvite, OrgMember } from "../../types";

/**
 * Settings → Organization panel.
 *
 * Surfaces the active organization (workspace), its members, and pending
 * invites. Owners/admins can invite people, change roles, and remove members;
 * owners can rename or delete a team org. Anyone can accept an invite by token.
 */
const OrganizationPanel = () => {
  const { current, organizations, load: reloadOrgs, switchTo } = useOrgStore();
  const currentUser = useAuthStore((s) => s.user);
  const orgId = current?.id ?? null;
  const manage = canManageOrg(current?.role);
  const isOwner = current?.role === "owner";

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const [m, i] = await Promise.all([
        organizationsApi.listMembers(orgId),
        manage ? organizationsApi.listInvites(orgId) : Promise.resolve([]),
      ]);
      setMembers(m);
      setInvites(i);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load organization"));
    } finally {
      setLoading(false);
    }
  }, [orgId, manage]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!current) {
    return (
      <Card title="Organization">
        <div className="text-sm text-ink-faint">Loading workspace…</div>
      </Card>
    );
  }

  const handleRoleChange = async (m: OrgMember, role: "admin" | "member") => {
    if (!orgId) return;
    setBusy(true);
    setError(null);
    try {
      await organizationsApi.updateMemberRole(orgId, m.user_id, role);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update role"));
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveMember = async (m: OrgMember) => {
    if (!orgId) return;
    if (!confirm(`Remove ${m.email} from ${current.name}?`)) return;
    setBusy(true);
    setError(null);
    try {
      await organizationsApi.removeMember(orgId, m.user_id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not remove member"));
    } finally {
      setBusy(false);
    }
  };

  const handleRevokeInvite = async (inv: OrgInvite) => {
    if (!orgId) return;
    setBusy(true);
    setError(null);
    try {
      await organizationsApi.revokeInvite(orgId, inv.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not revoke invite"));
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async () => {
    if (!orgId) return;
    const name = prompt("Rename organization", current.name)?.trim();
    if (!name || name === current.name) return;
    setBusy(true);
    setError(null);
    try {
      await organizationsApi.rename(orgId, name);
      await reloadOrgs();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not rename organization"));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!orgId) return;
    if (!confirm(`Delete ${current.name}? This removes the org and its data for everyone.`))
      return;
    setBusy(true);
    setError(null);
    try {
      await organizationsApi.remove(orgId);
      // The active token is still scoped to the now-deleted org, which would
      // 403 every subsequent request. Switch into another org the user belongs
      // to (prefer their personal workspace) — switchTo re-issues the token
      // and reloads.
      const fallback =
        organizations.find((o) => o.id !== orgId && o.is_personal) ??
        organizations.find((o) => o.id !== orgId);
      if (fallback) {
        await switchTo(fallback.id);
      } else {
        window.location.assign("/dashboard");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete organization"));
      setBusy(false);
    }
  };

  return (
    <Card
      title="Organization"
      action={
        <div className="flex items-center gap-2">
          <Badge tone={current.is_personal ? "neutral" : "info"}>
            {current.is_personal ? "Personal" : "Team"}
          </Badge>
          <Badge tone="success">{current.role}</Badge>
        </div>
      }
    >
      {error && (
        <div className="mb-3 rounded-md bg-[rgba(212,38,78,0.08)] px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="text-base font-semibold text-ink">{current.name}</div>
          <div className="text-xs text-ink-faint">
            {members.length} member{members.length === 1 ? "" : "s"}
          </div>
        </div>
        {isOwner && !current.is_personal && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleRename} disabled={busy}>
              Rename
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Invite form (owner/admin only) */}
      {manage && orgId && (
        <InviteForm orgId={orgId} onInvited={load} />
      )}

      {/* Members */}
      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Members
        </div>
        {loading ? (
          <div className="text-sm text-ink-faint">Loading…</div>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.user_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">
                    {m.full_name || m.email}
                    {m.user_id === currentUser?.id && (
                      <span className="ml-1.5 text-xs text-ink-faint">(you)</span>
                    )}
                  </div>
                  <div className="truncate text-xs text-ink-faint">{m.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {manage && m.role !== "owner" ? (
                    <select
                      value={m.role}
                      onChange={(e) =>
                        handleRoleChange(m, e.target.value as "admin" | "member")
                      }
                      disabled={busy}
                      className="ring-signal rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink focus:border-signal"
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </select>
                  ) : (
                    <Badge tone={m.role === "owner" ? "info" : "neutral"}>
                      {m.role}
                    </Badge>
                  )}
                  {manage && m.role !== "owner" && m.user_id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveMember(m)}
                      disabled={busy}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending invites */}
      {manage && invites.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Pending invites
          </div>
          <ul className="space-y-2">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-line-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink">{inv.email}</div>
                  <div className="text-xs text-ink-faint">
                    {inv.role}
                    {inv.expires_at &&
                      ` · expires ${new Date(inv.expires_at).toLocaleDateString()}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleRevokeInvite(inv)}
                  disabled={busy}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AcceptInviteForm onAccepted={reloadOrgs} />
    </Card>
  );
};

/** Owner/admin form to invite a teammate by email. */
const InviteForm = ({
  orgId,
  onInvited,
}: {
  orgId: number;
  onInvited: () => Promise<void>;
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<OrgInvite | null>(null);

  const submit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const invite = await organizationsApi.createInvite(orgId, {
        email: email.trim(),
        role,
      });
      setCreated(invite);
      setEmail("");
      await onInvited();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create invite"));
    } finally {
      setBusy(false);
    }
  };

  const inviteLink = created
    ? `${window.location.origin}/login?invite=${created.token}`
    : "";

  return (
    <div className="mt-4 rounded-xl border border-line bg-panel-2 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Field label="Invite by email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
          />
        </Field>
        <Field label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "member")}
            className="ring-signal w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-signal"
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </Field>
        <Button onClick={submit} disabled={busy || !email.trim()}>
          {busy ? "Inviting…" : "Send invite"}
        </Button>
      </div>
      {error && <div className="mt-2 text-xs text-danger">{error}</div>}
      {created && (
        <div className="mt-3 rounded-lg border border-line bg-white px-3 py-2 text-xs">
          <div className="mb-1 font-medium text-ink">
            Invite created for {created.email}. Share this link:
          </div>
          <code className="block break-all text-ink-dim">{inviteLink}</code>
        </div>
      )}
    </div>
  );
};

/** Accept an invite by pasting its token (works for any signed-in user). */
const AcceptInviteForm = ({ onAccepted }: { onAccepted: () => Promise<void> }) => {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const t = token.trim();
    if (!t) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const org = await organizationsApi.acceptInvite(t);
      setMsg(`Joined ${org.name} as ${org.role}.`);
      setToken("");
      await onAccepted();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not accept invite"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Have an invite?
      </div>
      <div className="flex gap-2">
        <TextInput
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste invite token"
        />
        <Button variant="secondary" onClick={submit} disabled={busy || !token.trim()}>
          Accept
        </Button>
      </div>
      {msg && <div className="mt-2 text-xs text-success">{msg}</div>}
      {error && <div className="mt-2 text-xs text-danger">{error}</div>}
    </div>
  );
};

export default OrganizationPanel;
