"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveAuthority, type ActionResult } from "@/lib/admin/actions";
import type { AuthorityRow, ContentStatusDb } from "@/lib/supabase/database.types";
import { ErrorNote, Field, inputClass } from "./ui";

const KINDS = [
  { value: "organization", label: "Kashrus organisation" },
  { value: "posek", label: "Posek" },
  { value: "publication", label: "Published work" },
];

export function AuthorityForm({ authority }: { authority: AuthorityRow | null }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveAuthority, null);
  const [status, setStatus] = useState<ContentStatusDb>(authority?.status ?? "draft");

  return (
    <form action={formAction} className="space-y-6">
      {authority && <input type="hidden" name="id" value={authority.id} />}
      <input type="hidden" name="status" value={status} />

      {state?.error && <ErrorNote message={state.error} />}

      <section className="panel p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" hint="As it should appear in a citation.">
            <input id="name" name="name" defaultValue={authority?.name ?? ""} required autoFocus className={inputClass} />
          </Field>

          <Field label="Short name" htmlFor="short_name" hint="Used in dense lists. Optional.">
            <input id="short_name" name="short_name" defaultValue={authority?.short_name ?? ""} className={inputClass} />
          </Field>

          <Field label="Kind" htmlFor="kind">
            <select id="kind" name="kind" defaultValue={authority?.kind ?? "organization"} className={inputClass}>
              {KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Region" htmlFor="region" hint="Which supply their guidance covers.">
            <input id="region" name="region" defaultValue={authority?.region ?? ""} placeholder="North America" className={inputClass} />
          </Field>

          <Field label="Web address" htmlFor="slug" hint="Leave blank to generate it from the name.">
            <input id="slug" name="slug" defaultValue={authority?.slug ?? ""} className={inputClass} />
          </Field>

          <Field label="Order" htmlFor="sort_order" hint="Lower numbers appear first. Default 100.">
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={authority?.sort_order ?? 100}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Description"
          htmlFor="description"
          className="mt-4"
          hint="A sentence or two on what they publish and what it covers."
        >
          <textarea
            id="description"
            name="description"
            defaultValue={authority?.description ?? ""}
            rows={3}
            className={inputClass}
          />
        </Field>

        <Field label="Official site" htmlFor="website_url" className="mt-4" hint="Optional.">
          <input id="website_url" name="website_url" type="url" defaultValue={authority?.website_url ?? ""} className={inputClass} />
        </Field>
      </section>

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
            <span className="block text-[0.75rem] text-muted">
              Positions attributed to an unapproved authority stay hidden too.
            </span>
          </span>
        </label>
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md px-5 py-2.5 text-[0.9375rem] font-semibold text-panel transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "var(--color-ink)" }}
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}
