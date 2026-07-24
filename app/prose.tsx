import type { ReactNode } from "react";

// Lightweight prose primitives for content pages (no typography plugin).
// Angular by design — square bullets, hard rules — matching the site aesthetic.

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-[var(--line)] pt-7 first:mt-0 first:border-0 first:pt-0">
      <h2 className="u-display text-xl font-medium leading-tight text-[var(--ink)]">
        {title}
      </h2>
      <div className="mt-3.5 space-y-3.5">{children}</div>
    </section>
  );
}

export function P({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[15px] leading-relaxed text-[var(--ink)]/85 ${className}`}
    >
      {children}
    </p>
  );
}

export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 text-[15px] leading-relaxed text-[var(--ink)]/85">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span
            aria-hidden
            className="mt-[8px] h-1.5 w-1.5 shrink-0 bg-[var(--gold)]"
          />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// A labelled fact box (used for the shop cards and worked examples).
export function Panel({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-[var(--line-strong)] bg-[var(--card)]">
      {label && (
        <div className="u-mono border-b border-[var(--line)] bg-[var(--paper-2)]/60 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--ink)]/70">
          {label}
        </div>
      )}
      <div className="space-y-2.5 px-3.5 py-3.5 text-[14px] leading-relaxed text-[var(--ink)]/85">
        {children}
      </div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-[var(--gold)] bg-[var(--paper-2)]/40 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#6f6248]">
      {children}
    </p>
  );
}
