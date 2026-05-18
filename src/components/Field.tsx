import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}

export const Field = ({ label, children, hint, error }: FieldProps) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-slate-700">
      {label}
    </span>
    {children}
    {hint && !error && (
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
    )}
    {error && (
      <span className="mt-1 block text-xs text-rose-600">{error}</span>
    )}
  </label>
);

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
      props.className ?? ""
    }`}
  />
);

export const TextArea = (
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) => (
  <textarea
    {...props}
    className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
      props.className ?? ""
    }`}
  />
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const styles: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button {...rest} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

interface BadgeProps {
  tone?: "success" | "warn" | "danger" | "neutral" | "info";
  children: ReactNode;
}

export const Badge = ({ tone = "neutral", children }: BadgeProps) => {
  const tones: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warn: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-indigo-50 text-indigo-700 border-indigo-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
};
