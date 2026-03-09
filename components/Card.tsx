import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
};

export default function Card({ children, className = "", title, subtitle, right }: CardProps) {
  return (
    <section
      className={`rounded-3xl border border-[color:var(--np-border)] bg-[color:var(--np-card)] p-4 shadow-[var(--np-shadow-card)] backdrop-blur-xl ${className}`}
    >
      {(title || subtitle || right) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-wide text-[color:var(--np-text)]">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-[color:var(--np-muted)]">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
