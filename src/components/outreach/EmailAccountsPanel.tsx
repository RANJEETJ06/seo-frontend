import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage, outreachApi } from "../../api";
import { Badge, Button, Field, TextInput } from "../Field";
import Card from "../Card";
import type { EmailAccount } from "../../types";

/**
 * Settings → Email Accounts panel.
 *
 * Lets a user connect multiple Gmail mailboxes, tune each mailbox's daily
 * send cap, refresh the list of verified send-as identities, and disconnect.
 * Connect button kicks off the OAuth flow by asking the backend to build the
 * Google auth URL with our `/oauth/google/callback` page as the redirect_uri.
 */
const EmailAccountsPanel = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await outreachApi.listAccounts();
      setAccounts(list);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load email accounts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleConnect = async () => {
    try {
      const redirect = `${window.location.origin}/oauth/google/callback`;
      const { auth_url } = await outreachApi.getGoogleAuthUrl(redirect);
      window.location.assign(auth_url);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not start Gmail connection"));
    }
  };

  const handleDisconnect = async (id: number) => {
    if (!confirm("Disconnect this Gmail account? Outreach using it will stop.")) return;
    setBusyId(id);
    try {
      await outreachApi.disconnectAccount(id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not disconnect account"));
    } finally {
      setBusyId(null);
    }
  };

  const handleRefresh = async (id: number) => {
    setBusyId(id);
    try {
      await outreachApi.refreshSenders(id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not refresh send-as identities"));
    } finally {
      setBusyId(null);
    }
  };

  const handleCapChange = async (id: number, cap: number) => {
    if (cap < 1 || cap > 2000) return;
    setBusyId(id);
    try {
      await outreachApi.updateAccount(id, { daily_send_cap: cap });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update daily cap"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card
      title="Connected Gmail accounts"
      action={
        <Button onClick={handleConnect} variant="primary">
          Connect Gmail
        </Button>
      }
    >
      {error && (
        <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {!loading && accounts.length === 0 && (
        <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No mailboxes connected yet. Click <strong>Connect Gmail</strong> to add one.
          You can connect multiple Gmail addresses — each is a separate sender.
        </div>
      )}
      <ul className="space-y-3">
        {accounts.map((a) => (
          <AccountRow
            key={a.id}
            account={a}
            busy={busyId === a.id}
            onDisconnect={() => handleDisconnect(a.id)}
            onRefresh={() => handleRefresh(a.id)}
            onCapChange={(v) => handleCapChange(a.id, v)}
          />
        ))}
      </ul>
    </Card>
  );
};

interface RowProps {
  account: EmailAccount;
  busy: boolean;
  onDisconnect: () => void;
  onRefresh: () => void;
  onCapChange: (cap: number) => void;
}

const AccountRow = ({ account, busy, onDisconnect, onRefresh, onCapChange }: RowProps) => {
  const [cap, setCap] = useState(account.daily_send_cap);
  const sendsLeft = Math.max(account.daily_send_cap - account.sends_today, 0);
  const pct = account.daily_send_cap
    ? Math.min(100, Math.round((account.sends_today / account.daily_send_cap) * 100))
    : 0;
  const tone = pct >= 90 ? "danger" : pct >= 60 ? "warn" : "success";
  return (
    <li className="rounded-md border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{account.email_address}</span>
            <Badge tone={account.is_active ? "success" : "neutral"}>
              {account.is_active ? "active" : "disconnected"}
            </Badge>
          </div>
          {account.display_name && (
            <div className="text-xs text-slate-500">{account.display_name}</div>
          )}
          {account.last_error && (
            <div className="mt-1 text-xs text-rose-600">Last error: {account.last_error}</div>
          )}
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Button variant="secondary" onClick={onRefresh} disabled={busy}>
            Refresh senders
          </Button>
          <Button variant="danger" onClick={onDisconnect} disabled={busy}>
            Disconnect
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <Field label="Daily send cap" hint="Sends per day Gmail will accept. We auto-stop when reached.">
            <div className="flex gap-2">
              <TextInput
                type="number"
                min={1}
                max={2000}
                value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
              />
              <Button
                variant="secondary"
                onClick={() => onCapChange(cap)}
                disabled={busy || cap === account.daily_send_cap}
              >
                Save
              </Button>
            </div>
          </Field>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-medium text-slate-700">Today's usage</div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full ${
                tone === "danger"
                  ? "bg-rose-500"
                  : tone === "warn"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {account.sends_today} sent · {sendsLeft} remaining
            {account.last_used_at && ` · last sent ${new Date(account.last_used_at).toLocaleString()}`}
          </div>
        </div>
      </div>

      {account.send_as.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-slate-700">Verified send-as identities</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {account.send_as.map((s) => (
              <Badge key={s.email} tone={s.is_default ? "info" : "neutral"}>
                {s.email}
                {s.is_default && " · default"}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

export default EmailAccountsPanel;
