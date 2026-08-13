"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { RiskGauge } from "@/components/RiskGauge";
import { saveProduce, type ActionResult } from "@/lib/admin/actions";
import { RISK, RISK_ORDER, type RiskLevel } from "@/lib/risk";
import type { AuthorityRow, ContentStatusDb, ProduceCategoryRow } from "@/lib/supabase/database.types";
import type { AdminProduceRow } from "@/lib/admin/queries";
import { ErrorNote, Field, inputClass } from "./ui";

/**
 * The produce editor.
 *
 * The part that had to be right is the positions list: adding another
 * authority's position is one click and stays on this screen, because in
 * practice an editor is working from one source document that covers a dozen
 * items and switching screens per position would make the job unbearable.
 *
 * Rulings are held in component state and submitted as one JSON field. That
 * keeps a half-finished row from being lost on a validation error, which
 * per-row form submission would not.
 */

interface RulingDraft {
  key: string;
  id?: string;
  authority_id: string;
  risk_level: number;
  guidance: string;
  citation: string;
  source_url: string;
  effective_date: string;
  notes: string;
  status: ContentStatusDb;
  deleted?: boolean;
}

interface ProduceFormProps {
  item: AdminProduceRow | null;
  categories: ProduceCategoryRow[];
  authorities: AuthorityRow[];
}

export function ProduceForm({ item, categories, authorities }: ProduceFormProps) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveProduce, null);

  const [rulings, setRulings] = useState<RulingDraft[]>(() =>
    (item?.rulings ?? []).map((r, i) => ({
      key: `existing-${i}`,
      id: r.id,
      authority_id: r.authority_id,
      risk_level: r.risk_level,
      guidance: r.guidance,
      citation: r.citation,
      source_url: r.source_url ?? "",
      effective_date: r.effective_date ?? "",
      notes: r.notes,
      status: r.status,
    })),
  );

  const [status, setStatus] = useState<ContentStatusDb>(item?.status ?? "draft");
  const [siteLevel, setSiteLevel] = useState<string>(item?.site_risk_level ? String(item.site_risk_level) : "");

  const visible = rulings.filter((r) => !r.deleted);
  const usedAuthorities = new Set(visible.map((r) => r.authority_id).filter(Boolean));

  const unusedAuthority = useMemo(
    () => authorities.find((a) => !usedAuthorities.has(a.id))?.id ?? "",
    [authorities, usedAuthorities],
  );

  const addRuling = () => {
    setRulings((current) => [
      ...current,
      {
        key: `new-${Date.now()}-${current.length}`,
        authority_id: unusedAuthority,
        risk_level: 3,
        guidance: "",
        citation: "",
        source_url: "",
        effective_date: "",
        notes: "",
        status: "draft",
      },
    ]);
  };

  const patch = (key: string, changes: Partial<RulingDraft>) =>
    setRulings((current) => current.map((r) => (r.key === key ? { ...r, ...changes } : r)));

  const remove = (key: string) =>
    setRulings((current) =>
      current.flatMap((r) => (r.key !== key ? [r] : r.id ? [{ ...r, deleted: true }] : [])),
    );

  return (
    <form action={formAction} className="space-y-6">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="status" value={status} />
      <input
        type="hidden"
        name="rulings"
        value={JSON.stringify(
          rulings.map(({ key: _key, ...rest }) => ({ ...rest, source_url: rest.source_url || null, effective_date: rest.effective_date || null })),
        )}
      />

      {state?.error && <ErrorNote message={state.error} />}

      {/* ---- identity ---- */}
      <section className="panel p-5">
        <h2 className="font-display text-[1.25rem]">The item</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" hint="What people call it. Used for search.">
            <input id="name" name="name" defaultValue={item?.name ?? ""} required autoFocus className={inputClass} />
          </Field>

          <Field label="Web address" htmlFor="slug" hint="Leave blank to generate it from the name.">
            <input id="slug" name="slug" defaultValue={item?.slug ?? ""} placeholder="romaine-lettuce" className={inputClass} />
          </Field>

          <Field label="Also known as" htmlFor="aka" hint="Other names, separated by commas. These are searched too.">
            <input
              id="aka"
              name="also_known_as"
              defaultValue={(item?.also_known_as ?? []).join(", ")}
              placeholder="Cos lettuce, romaine hearts"
              className={inputClass}
            />
          </Field>

          <Field label="Category" htmlFor="category">
            <select id="category" name="category_id" defaultValue={item?.category_id ?? ""} className={inputClass}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Summary"
          htmlFor="summary"
          className="mt-4"
          hint="One sentence. This is the line someone reads standing in the aisle."
        >
          <input id="summary" name="summary" defaultValue={item?.summary ?? ""} className={inputClass} />
        </Field>

        <Field
          label="What to do"
          htmlFor="cleaning_guidance"
          className="mt-4"
          hint="The practical instructions. Blank lines make paragraphs; **text** is bold; - starts a list."
        >
          <textarea
            id="cleaning_guidance"
            name="cleaning_guidance"
            defaultValue={item?.cleaning_guidance ?? ""}
            rows={8}
            className={`${inputClass} font-mono text-[0.875rem] leading-relaxed`}
          />
        </Field>

        <Field
          label="Season and region note"
          htmlFor="season_note"
          className="mt-4"
          hint="Optional. When and where this item is worse or better than usual."
        >
          <input id="season_note" name="season_note" defaultValue={item?.season_note ?? ""} className={inputClass} />
        </Field>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Image path" htmlFor="image_path" hint="Object path inside the produce-images bucket, e.g. romaine.jpg.">
            <input id="image_path" name="image_path" defaultValue={item?.image_path ?? ""} className={inputClass} />
          </Field>
          <Field label="Image description" htmlFor="image_alt" hint="For screen readers. Describe the photograph.">
            <input id="image_alt" name="image_alt" defaultValue={item?.image_alt ?? ""} className={inputClass} />
          </Field>
        </div>
      </section>

      {/* ---- site level ---- */}
      <section className="panel p-5">
        <h2 className="font-display text-[1.25rem]">Site summary level</h2>
        <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          This is the site&rsquo;s own editorial summary, shown to visitors who have not chosen a rabbi. It is never
          calculated from the positions below — deciding between them is not this site&rsquo;s job. Leave it blank if
          there is no single answer.
        </p>

        <input type="hidden" name="site_risk_level" value={siteLevel} />

        <div className="mt-4 flex flex-wrap gap-2">
          <LevelButton value="" current={siteLevel} onSelect={setSiteLevel} label="No level" />
          {RISK_ORDER.map((level) => (
            <LevelButton key={level} value={String(level)} current={siteLevel} onSelect={setSiteLevel} level={level} />
          ))}
        </div>
      </section>

      {/* ---- positions ---- */}
      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.25rem]">Positions</h2>
            <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
              One per authority. Each is approved separately — an approved item never publishes a draft position
              attributed to a named rabbi.
            </p>
          </div>
          <button
            type="button"
            onClick={addRuling}
            className="shrink-0 rounded-md px-3 py-2 text-[0.875rem] font-semibold text-panel"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            + Add a position
          </button>
        </div>

        {visible.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-edge px-4 py-6 text-center text-[0.875rem] text-muted">
            No positions yet. Add one for each authority whose ruling you are recording.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {visible.map((ruling) => (
              <li key={ruling.key} className="rounded-lg border border-edge bg-paper p-4">
                <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                  <Field label="Authority">
                    <select
                      value={ruling.authority_id}
                      onChange={(e) => patch(ruling.key, { authority_id: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Choose an authority</option>
                      {authorities.map((a) => (
                        <option
                          key={a.id}
                          value={a.id}
                          disabled={a.id !== ruling.authority_id && usedAuthorities.has(a.id)}
                        >
                          {a.name}
                          {a.id !== ruling.authority_id && usedAuthorities.has(a.id) ? " — already listed" : ""}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Level">
                    <select
                      value={ruling.risk_level}
                      onChange={(e) => patch(ruling.key, { risk_level: Number(e.target.value) })}
                      className={inputClass}
                    >
                      {RISK_ORDER.map((level) => (
                        <option key={level} value={level}>
                          {level} — {RISK[level].label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Guidance" className="mt-3" hint="What this authority says to do. One or two sentences.">
                  <textarea
                    value={ruling.guidance}
                    onChange={(e) => patch(ruling.key, { guidance: e.target.value })}
                    rows={2}
                    className={inputClass}
                  />
                </Field>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Citation" className="sm:col-span-2">
                    <input
                      value={ruling.citation}
                      onChange={(e) => patch(ruling.key, { citation: e.target.value })}
                      placeholder="Sefer Bedikas HaMazon, 2nd ed., p. 112"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Dated">
                    <input
                      type="date"
                      value={ruling.effective_date}
                      onChange={(e) => patch(ruling.key, { effective_date: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Source link" hint="Optional.">
                    <input
                      type="url"
                      value={ruling.source_url}
                      onChange={(e) => patch(ruling.key, { source_url: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Qualifying note" hint="Optional. Scope limits, e.g. 'greenhouse supply only'.">
                    <input
                      value={ruling.notes}
                      onChange={(e) => patch(ruling.key, { notes: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-3">
                  <label className="flex items-center gap-2 text-[0.8125rem]">
                    <input
                      type="checkbox"
                      checked={ruling.status === "approved"}
                      onChange={(e) => patch(ruling.key, { status: e.target.checked ? "approved" : "draft" })}
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                    Reviewed and approved for publication
                  </label>

                  <button
                    type="button"
                    onClick={() => remove(ruling.key)}
                    className="text-[0.8125rem] underline underline-offset-4"
                    style={{ color: "var(--color-risk-1-fg)" }}
                  >
                    Remove this position
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- save ---- */}
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
              Unticked, this item stays invisible to the public.
            </span>
          </span>
        </label>

        <div className="flex items-center gap-3">
          {item && (
            <Link href={`/produce/${item.slug}`} target="_blank" className="link text-[0.875rem]">
              View
            </Link>
          )}
          <SaveButton />
        </div>
      </div>
    </form>
  );
}

function LevelButton({
  value,
  current,
  onSelect,
  level,
  label,
}: {
  value: string;
  current: string;
  onSelect: (value: string) => void;
  level?: RiskLevel;
  label?: string;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-[0.8125rem] font-semibold transition-colors"
      style={
        level
          ? {
              backgroundColor: selected ? `var(--color-risk-${level}-bg)` : "var(--color-panel)",
              color: selected ? `var(--color-risk-${level}-fg)` : "var(--color-muted)",
              borderColor: selected
                ? `color-mix(in srgb, var(--color-risk-${level}-mark) 45%, transparent)`
                : "var(--color-edge)",
            }
          : {
              backgroundColor: selected ? "var(--color-accent-soft)" : "var(--color-panel)",
              color: selected ? "var(--color-accent)" : "var(--color-muted)",
              borderColor: selected ? "var(--color-accent)" : "var(--color-edge)",
            }
      }
    >
      {level && <RiskGauge level={level} />}
      {label ?? `${level} — ${RISK[level!].label}`}
    </button>
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
