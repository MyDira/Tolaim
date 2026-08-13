import type { ContentStatusDb } from "@/lib/supabase/database.types";

/** Shared admin form primitives. Plain, dense, and consistent across forms. */

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-[0.8125rem] font-semibold">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-[0.75rem] leading-snug text-muted">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-edge bg-panel px-3 py-2 text-[0.9375rem] outline-none transition-colors focus:border-accent";

export function StatusPill({ status }: { status: ContentStatusDb }) {
  const approved = status === "approved";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
      style={{
        color: approved ? "var(--color-risk-5-fg)" : "var(--color-risk-3-fg)",
        backgroundColor: approved ? "var(--color-risk-5-bg)" : "var(--color-risk-3-bg)",
        borderColor: approved
          ? "color-mix(in srgb, var(--color-risk-5-mark) 30%, transparent)"
          : "color-mix(in srgb, var(--color-risk-3-mark) 30%, transparent)",
      }}
    >
      {approved ? "Approved" : "Draft"}
    </span>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border px-3 py-2 text-[0.875rem]"
      style={{
        color: "var(--color-risk-1-fg)",
        backgroundColor: "var(--color-risk-1-bg)",
        borderColor: "color-mix(in srgb, var(--color-risk-1-mark) 30%, transparent)",
      }}
    >
      {message}
    </p>
  );
}

export function SavedNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-md border px-3 py-2 text-[0.875rem]"
      style={{
        color: "var(--color-risk-5-fg)",
        backgroundColor: "var(--color-risk-5-bg)",
        borderColor: "color-mix(in srgb, var(--color-risk-5-mark) 30%, transparent)",
      }}
    >
      {children}
    </p>
  );
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[1.25rem] leading-snug">{title}</h2>
          {description && <p className="mt-1 max-w-xl text-[0.8125rem] leading-relaxed text-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
