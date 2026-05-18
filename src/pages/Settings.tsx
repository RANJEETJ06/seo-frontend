import type { ReactNode } from "react";
import { useAuthStore } from "../store/auth";
import Card from "../components/Card";
import { Badge } from "../components/Field";

const Settings = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Account and platform configuration.
        </p>
      </div>

      <Card title="Account">
        <dl className="space-y-3 text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Full name" value={user.full_name ?? "—"} />
          <Row
            label="Status"
            value={
              <Badge tone={user.is_active ? "success" : "danger"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            }
          />
          <Row
            label="Role"
            value={
              <Badge tone={user.is_superuser ? "info" : "neutral"}>
                {user.is_superuser ? "Admin" : "User"}
              </Badge>
            }
          />
          <Row
            label="Joined"
            value={new Date(user.created_at).toLocaleString()}
          />
          <Row label="User ID" value={`#${user.id}`} />
        </dl>
      </Card>

      <Card title="API">
        <dl className="space-y-3 text-sm">
          <Row
            label="Base URL"
            value={
              (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
              "http://localhost:8000/api/v1"
            }
          />
          <Row label="Auth" value="JWT bearer token (localStorage)" />
        </dl>
      </Card>
    </div>
  );
};

const Row = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
    <dt className="text-xs font-medium text-slate-500">{label}</dt>
    <dd className="text-slate-800">{value}</dd>
  </div>
);

export default Settings;
