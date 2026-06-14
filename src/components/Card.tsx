import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

const Card = ({ title, action, children, className = "" }: CardProps) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-line bg-panel bg-panel-sheen shadow-panel ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {title && (
            <h3 className="flex items-center gap-2.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-dim font-mono">
              <span className="h-3 w-px bg-signal" aria-hidden="true" />
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

export default Card;
