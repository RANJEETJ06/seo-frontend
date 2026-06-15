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
      className={`group relative overflow-hidden rounded-2xl border border-line bg-panel shadow-panel transition-shadow duration-300 hover:shadow-lift ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title && (
            <h3 className="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <span
                className="h-1.5 w-1.5 rounded-full bg-signal-bright"
                aria-hidden="true"
              />
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
