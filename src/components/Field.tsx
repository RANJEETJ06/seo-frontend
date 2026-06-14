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
    <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ink-dim font-mono">
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
  "ring-signal w-full rounded-lg border border-line bg-bg-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-2 focus:bg-panel-2";

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
    "ring-signal group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0";
  const styles: Record<string, string> = {
    primary:
      "bg-signal text-white shadow-[0_2px_18px_-6px_var(--signal-glow)] hover:bg-signal-press hover:shadow-[0_4px_24px_-6px_var(--signal-glow)]",
    secondary:
      "border border-line-2 bg-white/[0.03] text-ink hover:bg-white/[0.07] hover:border-line-2",
    ghost: "text-ink-dim hover:bg-white/[0.05] hover:text-ink",
    danger:
      "border border-[rgba(251,113,133,0.3)] bg-[rgba(251,113,133,0.12)] text-danger hover:bg-[rgba(251,113,133,0.2)]",
  };
  return (
    <button {...rest} className={`${base} ${styles[variant]} ${className}`}>
      {/* sheen sweep on hover for the primary action */}
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 [transform:translateX(-120%)] group-hover/btn:animate-sheen group-hover/btn:opacity-100"
        />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
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
      "bg-[rgba(74,222,128,0.1)] text-success border-[rgba(74,222,128,0.22)]",
    warn: "bg-[rgba(245,196,81,0.1)] text-warn border-[rgba(245,196,81,0.22)]",
    danger:
      "bg-[rgba(251,113,133,0.1)] text-danger border-[rgba(251,113,133,0.22)]",
    info: "bg-[rgba(125,211,252,0.1)] text-info border-[rgba(125,211,252,0.22)]",
    neutral: "bg-white/[0.04] text-ink-dim border-line-2",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide font-mono ${tones[tone]}`}
    >
      {children}
    </span>
  );
};
