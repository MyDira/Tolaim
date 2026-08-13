/**
 * Generates supabase/seed.sql from the sample dataset.
 *
 *   npm run seed:gen
 *
 * The dataset lives in src/lib/data/seed-data.ts and is the single source of
 * truth: the site reads it directly when Supabase is not configured, and this
 * script emits the SQL equivalent. Keeping one source means the sample data a
 * developer sees and the sample data a fresh project gets cannot drift.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = resolve(root, "src/lib/data/seed-data.ts");
const target = resolve(root, "supabase/seed.sql");

// Transpile the TS module and evaluate it, so the script has no build step.
const transpiled = ts.transpileModule(readFileSync(source, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const module = { exports: {} };
const require = createRequire(import.meta.url);
new Function("exports", "require", "module", transpiled)(module.exports, require, module);

const { SEED_CATEGORIES, SEED_AUTHORITIES, SEED_PRODUCE, SEED_RABBIS, SEED_ALERTS } = module.exports;

// --- SQL helpers -----------------------------------------------------------

const q = (value) => (value === null || value === undefined ? "null" : `'${String(value).replace(/'/g, "''")}'`);
const arr = (values) => (values.length === 0 ? "'{}'" : `array[${values.map(q).join(", ")}]`);
const days = (n) => (n === null ? "null" : `now() + interval '${n} days'`);

const categoryId = (slug) => `(select id from produce_categories where slug = ${q(slug)})`;
const authorityId = (slug) => `(select id from authorities where slug = ${q(slug)})`;
const produceId = (slug) => `(select id from produce_items where slug = ${q(slug)})`;

const lines = [];
const w = (line = "") => lines.push(line);

// --- header ----------------------------------------------------------------

w("-- ===========================================================================");
w("-- Tolaim — sample data");
w("-- ===========================================================================");
w("-- GENERATED FILE. Edit src/lib/data/seed-data.ts and run `npm run seed:gen`.");
w("--");
w("-- SAMPLE CONTENT — NOT A HALACHIC SOURCE. Every authority, rabbi, ruling and");
w("-- alert below is invented for development. The organisation and rabbi names");
w("-- are deliberately generic so nothing here can be mistaken for a real");
w("-- published position. Replace all of it with reviewed content before launch:");
w("--");
w("--   delete from alerts; delete from rulings; delete from rabbis;");
w("--   delete from authorities; delete from produce_items;");
w("--");
w("-- Everything is inserted as approved so a fresh project has a working public");
w("-- site immediately. `approved_by` is null because no auth user exists yet.");
w("-- ===========================================================================");
w();
w("begin;");
w();

// --- categories ------------------------------------------------------------

w("-- Categories ---------------------------------------------------------------");
w("insert into produce_categories (slug, name, sort_order) values");
w(SEED_CATEGORIES.map((c) => `  (${q(c.slug)}, ${q(c.name)}, ${c.sortOrder})`).join(",\n"));
w("on conflict (slug) do nothing;");
w();

// --- authorities -----------------------------------------------------------

w("-- Authorities --------------------------------------------------------------");
w(
  "insert into authorities (slug, name, short_name, kind, region, description, website_url, sort_order, status, approved_at) values",
);
w(
  SEED_AUTHORITIES.map(
    (a) =>
      `  (${q(a.slug)}, ${q(a.name)}, ${q(a.shortName)}, ${q(a.kind)}::authority_kind, ${q(a.region)}, ${q(a.description)}, ${q(a.websiteUrl)}, ${a.sortOrder}, 'approved', now())`,
  ).join(",\n"),
);
w("on conflict (slug) do nothing;");
w();

// --- produce ---------------------------------------------------------------

w("-- Produce ------------------------------------------------------------------");
w(
  "insert into produce_items (slug, name, also_known_as, category_id, summary, cleaning_guidance, season_note, image_path, image_alt, site_risk_level, status, approved_at) values",
);
w(
  SEED_PRODUCE.map(
    (p) =>
      `  (${q(p.slug)}, ${q(p.name)}, ${arr(p.alsoKnownAs)}, ${categoryId(p.category)}, ${q(p.summary)}, ${q(p.cleaningGuidance)}, ${q(p.seasonNote ?? "")}, ${q(p.imagePath ?? null)}, ${q(p.name)}, ${p.siteRiskLevel ?? "null"}, 'approved', now())`,
  ).join(",\n"),
);
w("on conflict (slug) do nothing;");
w();

// --- rulings ---------------------------------------------------------------

w("-- Positions ----------------------------------------------------------------");
w(
  "insert into rulings (produce_id, authority_id, risk_level, guidance, citation, effective_date, notes, status, approved_at) values",
);
w(
  SEED_PRODUCE.flatMap((p) =>
    p.rulings.map(
      (r) =>
        `  (${produceId(p.slug)}, ${authorityId(r.authority)}, ${r.level}, ${q(r.guidance)}, ${q(r.citation)}, ${r.effectiveDate ? `${q(r.effectiveDate)}::date` : "null"}, ${q(r.notes ?? "")}, 'approved', now())`,
    ),
  ).join(",\n"),
);
w("on conflict (produce_id, authority_id) do nothing;");
w();

// --- rabbis ----------------------------------------------------------------

w("-- Rabbis -------------------------------------------------------------------");
w(
  "insert into rabbis (slug, name, community, region, description, default_authority_id, status, approved_at) values",
);
w(
  SEED_RABBIS.map(
    (r) =>
      `  (${q(r.slug)}, ${q(r.name)}, ${q(r.community)}, ${q(r.region)}, ${q(r.description)}, ${r.defaultAuthority ? authorityId(r.defaultAuthority) : "null"}, 'approved', now())`,
  ).join(",\n"),
);
w("on conflict (slug) do nothing;");
w();

const overrides = SEED_RABBIS.flatMap((r) => r.overrides.map((o) => ({ rabbi: r.slug, ...o })));
if (overrides.length > 0) {
  w("insert into rabbi_authority_overrides (rabbi_id, produce_id, authority_id, note) values");
  w(
    overrides
      .map(
        (o) =>
          `  ((select id from rabbis where slug = ${q(o.rabbi)}), ${produceId(o.produce)}, ${authorityId(o.authority)}, ${q(o.note)})`,
      )
      .join(",\n"),
  );
  w("on conflict (rabbi_id, produce_id) do nothing;");
  w();
}

// --- alerts ----------------------------------------------------------------

w("-- Alerts -------------------------------------------------------------------");
w("-- Dates are relative to when this file is run, so the demo always has live");
w("-- alerts and a populated archive.");
w(
  "insert into alerts (slug, title, summary, body, severity, region, published_at, expires_at, status, approved_at) values",
);
w(
  SEED_ALERTS.map(
    (a) =>
      `  (${q(a.slug)}, ${q(a.title)}, ${q(a.summary)}, ${q(a.body)}, ${q(a.severity)}::alert_severity, ${q(a.region)}, ${days(a.publishedOffsetDays)}, ${days(a.expiresOffsetDays)}, 'approved', now())`,
  ).join(",\n"),
);
w("on conflict (slug) do nothing;");
w();

w("insert into alert_produce (alert_id, produce_id) values");
w(
  SEED_ALERTS.flatMap((a) =>
    a.produce.map((slug) => `  ((select id from alerts where slug = ${q(a.slug)}), ${produceId(slug)})`),
  ).join(",\n"),
);
w("on conflict do nothing;");
w();

w("commit;");
w();

writeFileSync(target, lines.join("\n"), "utf8");

console.log(
  `Wrote ${target}\n  ${SEED_CATEGORIES.length} categories, ${SEED_AUTHORITIES.length} authorities, ` +
    `${SEED_PRODUCE.length} produce items, ${SEED_PRODUCE.reduce((n, p) => n + p.rulings.length, 0)} positions, ` +
    `${SEED_RABBIS.length} rabbis, ${SEED_ALERTS.length} alerts.`,
);
