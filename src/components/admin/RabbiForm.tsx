"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveRabbi, type ActionResult } from "@/lib/admin/actions";
import type { AuthorityRow, ContentStatusDb } from "@/lib/supabase/database.types";
import type { AdminProduceRow, AdminRabbiRow } from "@/lib/admin/queries";
import { ErrorNote, Field, inputClass } from "./ui";

/**
 * Rabbi-to-authority mapping.
 *
 * The common case is one line — "follows X across the board" — so that is the
 * only required field. Per-item exceptions are a separate, optional list,
 * because most rabbis have none and the form should not imply otherwise.
 */

interface OverrideDraft {
  key: string;
  produce_id: string;
  authority_id: string;
  note: string;
}

interface RabbiFormProps {
  rabbi: AdminRabbiRow | null;
  authorities: AuthorityRow[];
  produce: AdminProduceRow[];
}

export function RabbiForm({ rabbi, authorities, produce }: RabbiFormProps) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveRabbi, null);
  const [status, setStatus] = useState<ContentStatusDb>(rabbi?.status ?? "draft");
  const [overrides, setOverrides] = useState<OverrideDraft[]>(() =>
    (rabbi?.overrides ?? []).map((o, i) => ({
      key: `existing-${i}`,
      produce_id: o.produce_id,
      authority_id: o.authority_id,
      note: o.note,
    })),
  );

  const usedProduce = new Set(overrides.map((o) => o.produce_id).filter(Boolean));

  const addOverride = () =>
    setOverrides((current) => [
      ...current,
      { key: `new-${Date.now()}-${current.length}`, produce_id: "", authority_id: "", note: "" },
    ]);

  const patch = (key: string, changes: Partial<OverrideDraft>) =>
    setOverrides((current) => current.map((o) => (o.key === key ? { ...o, ...changes } : o)));

  const remove = (key: string) => setOverrides((current) => current.filter((o) => o.key !== key));

  return (
    <form action={formAction} className="space-y-6">
      {rabbi && <input type="hidden" name="id" value={rabbi.id} />}
      <input type="hidden" name="status" value={status} />
      <input
        type="hidden"
        name="overrides"
        value={JSON.stringify(overrides.map(({ key: _key, ...rest }) => rest))}
      />

      {state?.error && <ErrorNote message={state.error} />}

      <section className="panel p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" defaultValue={rabbi?.name ?? ""} required autoFocus className={inputClass} />
          </Field>

          <Field label="Community" htmlFor="community" hint="How people would recognise which rabbi this is.">
            <input id="community" name="community" defaultValue={rabbi?.community ?? ""} className={inputClass} />
          </Field>

          <Field label="Region" htmlFor="region">
            <input id="region" name="region" defaultValue={rabbi?.region ?? ""} className={inputClass} />
          </Field>

          <Field label="Web address" htmlFor="slug" hint="Leave blank to generate it from the name.">
            <input id="slug" name="slug" defaultValue={rabbi?.slug ?? ""} className={inputClass} />
          </Field>
        </div>

        <Field
          label="Follows"
          htmlFor="default_authority_id"
          className="mt-4"
          hint="The authority whose positions apply unless an exception below says otherwise."
        >
          <select
            id="default_authority_id"
            name="default_authority_id"
            defaultValue={rabbi?.default_authority_id ?? ""}
            className={inputClass}
          >
            <option value="">Not recorded</option>
            {authorities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Note" htmlFor="description" className="mt-4" hint="Shown on the rabbi picker. One sentence.">
          <textarea
            id="description"
            name="description"
            defaultValue={rabbi?.description ?? ""}
            rows={2}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.25rem]">Exceptions</h2>
            <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
              Only for items where this rabbi follows someone other than the authority above. Most rabbis have none.
            </p>
          </div>
          <button
            type="button"
            onClick={addOverride}
            className="shrink-0 rounded-md border border-edge px-3 py-2 text-[0.875rem] font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            + Add an exception
          </button>
        </div>

        {overrides.length > 0 && (
          <ul className="mt-4 space-y-3">
            {overrides.map((override) => (
              <li key={override.key} className="rounded-lg border border-edge bg-paper p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="On this item">
                    <select
                      value={override.produce_id}
                      onChange={(e) => patch(override.key, { produce_id: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Choose an item</option>
                      {produce.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={p.id !== override.produce_id && usedProduce.has(p.id)}
                        >
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Follows instead">
                    <select
                      value={override.authority_id}
                      onChange={(e) => patch(override.key, { authority_id: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Choose an authority</option>
                      {authorities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Note" className="mt-3" hint="Shown to visitors who have chosen this rabbi.">
                  <input
                    value={override.note}
                    onChange={(e) => patch(override.key, { note: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <button
                  type="button"
                  onClick={() => remove(override.key)}
                  className="mt-3 text-[0.8125rem] underline underline-offset-4"
                  style={{ color: "var(--color-risk-1-fg)" }}
                >
                  Remove this exception
                </button>
              </li>
            ))}
          </ul>
        )}
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
              Naming a rabbi&rsquo;s practice publicly needs review like anything else.
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
