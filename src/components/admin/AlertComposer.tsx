"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveAlert, type ActionResult } from "@/lib/admin/actions";
import type { AlertSeverityDb, ContentStatusDb } from "@/lib/supabase/database.types";
import type { AdminAlertRow, AdminProduceRow } from "@/lib/admin/queries";
import { ErrorNote, Field, inputClass } from "./ui";

/**
 * The alert composer.
 *
 * Target: blank to published in about ninety seconds. What that means in
 * practice — every field that can have a sensible default has one (published
 * now, expires in thirty days, advisory), the produce picker filters as you
 * type instead of making you scroll a list of hundreds, and the primary button
 * publishes rather than saving a draft you then have to go and approve.
 */

const SEVERITIES: { value: AlertSeverityDb; label: string; hint: string }[] = [
  { value: "urgent", label: "Urgent", hint: "Change what people do at the sink today" },
  { value: "advisory", label: "Advisory", hint: "Worth knowing before you shop" },
  { value: "info", label: "Notice", hint: "For the record" },
];

/** `datetime-local` wants local time with no zone, trimmed to minutes. */
function toLocalInput(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

interface AlertComposerProps {
  alert: AdminAlertRow | null;
  produce: AdminProduceRow[];
}

export function AlertComposer({ alert, produce }: AlertComposerProps) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveAlert, null);

  const [severity, setSeverity] = useState<AlertSeverityDb>(alert?.severity ?? "advisory");
  const [status, setStatus] = useState<ContentStatusDb>(alert?.status ?? "approved");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set((alert?.alert_produce ?? []).map((link) => link.produce_id)),
  );
  const [filter, setFilter] = useState("");

  const defaults = useMemo(() => {
    const now = new Date();
    const inThirtyDays = new Date(now.getTime() + 30 * 86_400_000);
    return {
      published: alert ? toLocalInput(alert.published_at) : toLocalInput(now),
      expires: alert?.expires_at ? toLocalInput(alert.expires_at) : toLocalInput(inThirtyDays),
    };
  }, [alert]);

  const matches = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return produce.slice(0, 12);
    return produce.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 12);
  }, [filter, produce]);

  const selectedItems = produce.filter((p) => selected.has(p.id));

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={formAction} className="space-y-6">
      {alert && <input type="hidden" name="id" value={alert.id} />}
      <input type="hidden" name="severity" value={severity} />
      <input type="hidden" name="status" value={status} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="produce_ids" value={id} />
      ))}

      {state?.error && <ErrorNote message={state.error} />}

      {/* ---- the notice ---- */}
      <section className="panel p-5">
        <Field label="Title" htmlFor="title" hint="Say what changed, not that something changed.">
          <input
            id="title"
            name="title"
            defaultValue={alert?.title ?? ""}
            required
            autoFocus
            placeholder="Thrips surge in local romaine — check twice this month"
            className={`${inputClass} text-[1.0625rem]`}
          />
        </Field>

        <Field
          label="Summary"
          htmlFor="summary"
          className="mt-4"
          hint="One line. This is what shows in the feed and on the produce pages it affects."
        >
          <input id="summary" name="summary" defaultValue={alert?.summary ?? ""} className={inputClass} />
        </Field>

        <Field
          label="Body"
          htmlFor="body"
          className="mt-4"
          hint="Blank lines make paragraphs; **text** is bold; - starts a list. Say what to do."
        >
          <textarea
            id="body"
            name="body"
            defaultValue={alert?.body ?? ""}
            rows={10}
            className={`${inputClass} font-mono text-[0.875rem] leading-relaxed`}
          />
        </Field>
      </section>

      {/* ---- severity and dates ---- */}
      <section className="panel p-5">
        <h2 className="font-display text-[1.25rem]">How loud, and for how long</h2>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {SEVERITIES.map((option) => {
            const active = severity === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSeverity(option.value)}
                aria-pressed={active}
                className="rounded-md border px-3 py-2.5 text-left transition-colors"
                style={{
                  borderColor: active ? `var(--color-sev-${option.value})` : "var(--color-edge)",
                  backgroundColor: active ? "var(--color-paper)" : "var(--color-panel)",
                }}
              >
                <span
                  className="block text-[0.875rem] font-semibold"
                  style={{ color: active ? `var(--color-sev-${option.value})` : "var(--color-ink)" }}
                >
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[0.75rem] leading-snug text-muted">{option.hint}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Publish at" htmlFor="published_at" hint="Defaults to now.">
            <input
              id="published_at"
              name="published_at"
              type="datetime-local"
              defaultValue={defaults.published}
              className={inputClass}
            />
          </Field>

          <Field label="Expires" htmlFor="expires_at" hint="Defaults to 30 days. Blank means it never expires.">
            <input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              defaultValue={defaults.expires}
              className={inputClass}
            />
          </Field>

          <Field label="Region" htmlFor="region" hint="Optional. Who this applies to.">
            <input id="region" name="region" defaultValue={alert?.region ?? ""} placeholder="North America" className={inputClass} />
          </Field>
        </div>

        <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
          When an alert expires it moves to the public archive rather than disappearing. It is never deleted.
        </p>

        <Field label="Web address" htmlFor="slug" className="mt-4" hint="Leave blank to generate it from the title.">
          <input id="slug" name="slug" defaultValue={alert?.slug ?? ""} className={inputClass} />
        </Field>
      </section>

      {/* ---- affected produce ---- */}
      <section className="panel p-5">
        <h2 className="font-display text-[1.25rem]">Produce affected</h2>
        <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          An active alert appears on each of these item pages, not only in the feed.
        </p>

        {selectedItems.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {selectedItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[0.8125rem]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)",
                    color: "var(--color-accent)",
                    backgroundColor: "var(--color-accent-soft)",
                  }}
                >
                  {item.name}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Start typing an item name"
          aria-label="Find produce to link"
          className={`${inputClass} mt-3`}
        />

        {matches.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {matches.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-pressed={selected.has(item.id)}
                  className="rounded-md border px-2 py-1 text-[0.8125rem] transition-colors"
                  style={{
                    borderColor: selected.has(item.id) ? "var(--color-accent)" : "var(--color-edge)",
                    color: selected.has(item.id) ? "var(--color-accent)" : "var(--color-muted)",
                  }}
                >
                  {selected.has(item.id) ? "✓ " : "+ "}
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[0.8125rem] text-muted">
            No item matches “{filter}”. Only items that exist can be linked — add the item first if it is missing.
          </p>
        )}
      </section>

      {/* ---- publish ---- */}
      <div className="panel panel-lift sticky bottom-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <label className="flex items-center gap-2 text-[0.875rem]">
          <input
            type="checkbox"
            checked={status === "approved"}
            onChange={(e) => setStatus(e.target.checked ? "approved" : "draft")}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>
            <span className="font-medium">Approved for publication</span>
            <span className="block text-[0.75rem] text-muted">Unticked, this saves as a draft nobody can see.</span>
          </span>
        </label>

        <div className="flex items-center gap-3">
          {alert && (
            <Link href={`/alerts/${alert.slug}`} target="_blank" className="link text-[0.875rem]">
              View
            </Link>
          )}
          <PublishButton approved={status === "approved"} editing={Boolean(alert)} />
        </div>
      </div>
    </form>
  );
}

function PublishButton({ approved, editing }: { approved: boolean; editing: boolean }) {
  const { pending } = useFormStatus();
  const label = pending ? "Saving…" : approved ? (editing ? "Save and publish" : "Publish") : "Save draft";

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md px-5 py-2.5 text-[0.9375rem] font-semibold text-panel transition-opacity disabled:opacity-60"
      style={{ backgroundColor: approved ? "var(--color-accent)" : "var(--color-ink)" }}
    >
      {label}
    </button>
  );
}
