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
    <span className="mb-1.5 block text-xs font-medium text-ink-dim">
      {label}
    </span>
    {children}
    {hint && !error && (
      <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span>
    )}
    {error && (
      <span className="mt-1.5 block text-xs text-danger">{error}</span>
    )}
  </label>
);

const inputBase =
  "ring-signal w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-2 focus:border-signal";

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputBase} ${props.className ?? ""}`} />
);

export const TextArea = (
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) => (
  <textarea {...props} className={`${inputBase} ${props.className ?? ""}`} />
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
    "ring-signal inline-flex select-none items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0";
  const styles: Record<string, string> = {
    primary:
      "bg-signal-bright text-signal-ink shadow-glow-soft hover:brightness-[0.96] hover:shadow-glow",
    secondary:
      "border border-line-2 bg-white text-ink hover:border-signal hover:text-signal",
    ghost: "text-ink-dim hover:bg-panel-2 hover:text-ink",
    danger:
      "border border-[rgba(212,38,78,0.3)] bg-[rgba(212,38,78,0.08)] text-danger hover:bg-[rgba(212,38,78,0.16)]",
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
    success:
      "bg-[rgba(0,135,90,0.1)] text-success border-[rgba(0,135,90,0.22)]",
    warn: "bg-[rgba(178,95,0,0.1)] text-warn border-[rgba(178,95,0,0.22)]",
    danger:
      "bg-[rgba(212,38,78,0.08)] text-danger border-[rgba(212,38,78,0.22)]",
    info: "bg-[rgba(10,111,181,0.08)] text-info border-[rgba(10,111,181,0.22)]",
    neutral: "bg-panel-2 text-ink-dim border-line-2",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
};
