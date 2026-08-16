/**
 * Imports real produce data from a CSV into loadable SQL.
 *
 *   npm run import -- data/produce.csv
 *
 * Writes supabase/import.sql. Nothing is invented: every field comes from the
 * file, rows that cannot be read are reported with their line number, and the
 * run aborts rather than emitting a partial file.
 *
 * One row per position — that is, per (produce item × authority). Produce-level
 * columns repeat on each of that item's rows; the first row for an item wins
 * and later disagreements are reported.
 *
 * Columns
 * -------
 * Required:
 *   produce              Item name, e.g. "Romaine lettuce"
 *   authority            Authority name, e.g. "Star-K"
 *   risk_level           1-5, or the exact label ("Expert checking")
 *
 * Optional, produce-level:
 *   slug, also_known_as (semicolon-separated), category, summary,
 *   cleaning_guidance, season_note, image, image_alt, site_risk_level
 *
 * Optional, position-level:
 *   guidance, citation, source_url, effective_date (YYYY-MM-DD), notes
 *
 * Optional, authority-level (first row for that authority wins):
 *   authority_kind (organization | posek | publication), authority_region,
 *   authority_url, authority_short_name
 *
 * Images
 * ------
 * `image` is the object path inside the produce-images bucket. This script does
 * not upload anything; it prints the set of paths it referenced so you can
 * check they all exist in the bucket.
 *
 * Everything is imported as DRAFT. Nothing reaches the public site until it is
 * approved in /admin — a bulk import is exactly the case where that matters.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const RISK_LABELS = {
  1: "Not recommended",
  2: "Expert checking",
  3: "Home checking",
  4: "Rinse only",
  5: "No checking",
};

const LABEL_TO_LEVEL = new Map(
  Object.entries(RISK_LABELS).map(([level, label]) => [label.toLowerCase(), Number(level)]),
);

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/** RFC 4180: quoted fields, doubled quotes, newlines inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let i = 0;

  const source = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");

  while (i < source.length) {
    const char = source[i];

    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// ---------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------

const q = (value) =>
  value === null || value === undefined || value === "" ? "null" : `'${String(value).replace(/'/g, "''")}'`;
const qs = (value) => `'${String(value ?? "").replace(/'/g, "''")}'`;
const arr = (values) => (values.length === 0 ? "'{}'" : `array[${values.map(qs).join(", ")}]`);

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run import -- <file.csv>\n\nSee the header of scripts/import-produce.mjs for the columns.");
  process.exit(1);
}

const rows = parseCsv(readFileSync(resolve(inputPath), "utf8"));
if (rows.length < 2) {
  console.error(`${inputPath} has no data rows.`);
  process.exit(1);
}

const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
const need = ["produce", "authority", "risk_level"];
const missing = need.filter((column) => !header.includes(column));
if (missing.length > 0) {
  console.error(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
  console.error(`Found: ${header.join(", ")}`);
  process.exit(1);
}

const problems = [];
const categories = new Map();
const authorities = new Map();
const produce = new Map();
const positions = [];
const images = new Set();

/** Accepts "2" or "Expert checking". Anything else is a reported problem. */
function readLevel(raw, line, column) {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  if (/^[1-5]$/.test(value)) return Number(value);

  const byLabel = LABEL_TO_LEVEL.get(value.toLowerCase());
  if (byLabel) return byLabel;

  problems.push(
    `line ${line}: ${column} is "${value}" — use 1-5, or one of: ${Object.values(RISK_LABELS).join(", ")}`,
  );
  return null;
}

rows.slice(1).forEach((cells, index) => {
  const line = index + 2;
  const get = (name) => {
    const at = header.indexOf(name);
    return at === -1 ? "" : (cells[at] ?? "").trim();
  };

  const produceName = get("produce");
  const authorityName = get("authority");

  if (!produceName) {
    problems.push(`line ${line}: no produce name`);
    return;
  }
  if (!authorityName) {
    problems.push(`line ${line}: no authority for "${produceName}"`);
    return;
  }

  // --- authority ----------------------------------------------------------
  const authoritySlug = slugify(authorityName);
  if (!authorities.has(authoritySlug)) {
    const kind = get("authority_kind") || "organization";
    if (!["organization", "posek", "publication"].includes(kind)) {
      problems.push(`line ${line}: authority_kind "${kind}" — use organization, posek or publication`);
    }
    authorities.set(authoritySlug, {
      slug: authoritySlug,
      name: authorityName,
      shortName: get("authority_short_name"),
      kind,
      region: get("authority_region"),
      url: get("authority_url"),
      sortOrder: (authorities.size + 1) * 10,
    });
  }

  // --- category -----------------------------------------------------------
  const categoryName = get("category");
  const categorySlug = categoryName ? slugify(categoryName) : "";
  if (categorySlug && !categories.has(categorySlug)) {
    categories.set(categorySlug, { slug: categorySlug, name: categoryName, sortOrder: (categories.size + 1) * 10 });
  }

  // --- produce ------------------------------------------------------------
  const produceSlug = get("slug") ? slugify(get("slug")) : slugify(produceName);
  const image = get("image");

  if (!produce.has(produceSlug)) {
    produce.set(produceSlug, {
      slug: produceSlug,
      name: produceName,
      alsoKnownAs: get("also_known_as")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
      categorySlug,
      summary: get("summary"),
      cleaningGuidance: get("cleaning_guidance"),
      seasonNote: get("season_note"),
      image,
      imageAlt: get("image_alt") || produceName,
      siteRiskLevel: readLevel(get("site_risk_level"), line, "site_risk_level"),
      firstLine: line,
    });
  } else {
    const existing = produce.get(produceSlug);
    if (existing.name !== produceName) {
      problems.push(
        `line ${line}: "${produceName}" and line ${existing.firstLine}'s "${existing.name}" both slug to ` +
          `"${produceSlug}". Give one of them an explicit, different slug column.`,
      );
    }
  }

  if (image) images.add(image);

  // --- position -----------------------------------------------------------
  const level = readLevel(get("risk_level"), line, "risk_level");
  if (level === null) return;

  const duplicate = positions.find((p) => p.produceSlug === produceSlug && p.authoritySlug === authoritySlug);
  if (duplicate) {
    problems.push(
      `line ${line}: ${authorityName} already has a position on ${produceName} (line ${duplicate.line}). ` +
        `One row per authority per item.`,
    );
    return;
  }

  const effectiveDate = get("effective_date");
  if (effectiveDate && !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)) {
    problems.push(`line ${line}: effective_date "${effectiveDate}" — use YYYY-MM-DD`);
  }

  positions.push({
    line,
    produceSlug,
    authoritySlug,
    level,
    guidance: get("guidance"),
    citation: get("citation"),
    sourceUrl: get("source_url"),
    effectiveDate,
    notes: get("notes"),
  });
});

// When positions are drawn from another organisation's published guidance, the
// attribution and the link back are the whole basis on which they are being
// reported. A row without either is reported so it is a decision, not an
// oversight. Warning by default — some positions genuinely have no public URL —
// and an error under --strict-sources.
const strictSources = process.argv.includes("--strict-sources");
const unsourced = positions.filter((p) => !p.citation && !p.sourceUrl);

if (unsourced.length > 0 && strictSources) {
  for (const p of unsourced) {
    problems.push(`line ${p.line}: no citation and no source_url — required under --strict-sources`);
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? "s" : ""} in ${basename(inputPath)}:\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error("\nNothing was written. Fix these and run it again.\n");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const lines = [];
const w = (line = "") => lines.push(line);

w("-- ===========================================================================");
w(`-- Tolaim — imported from ${basename(inputPath)}`);
w("-- ===========================================================================");
w("-- GENERATED FILE. Regenerate with: npm run import -- <file.csv>");
w("--");
w("-- Everything here is imported as DRAFT and is invisible to the public until");
w("-- it is approved in /admin. Re-running is safe: rows are matched on slug and");
w("-- updated in place, and approval state is left alone on rows that already");
w("-- exist, so a re-import never silently unpublishes reviewed content.");
w("-- ===========================================================================");
w();
w("begin;");
w();

if (categories.size > 0) {
  w("-- Categories ---------------------------------------------------------------");
  w("insert into produce_categories (slug, name, sort_order) values");
  w([...categories.values()].map((c) => `  (${qs(c.slug)}, ${qs(c.name)}, ${c.sortOrder})`).join(",\n"));
  w("on conflict (slug) do update set name = excluded.name;");
  w();
}

w("-- Authorities --------------------------------------------------------------");
w("insert into authorities (slug, name, short_name, kind, region, description, website_url, sort_order, status) values");
w(
  [...authorities.values()]
    .map(
      (a) =>
        `  (${qs(a.slug)}, ${qs(a.name)}, ${qs(a.shortName)}, ${qs(a.kind)}::authority_kind, ${qs(a.region)}, '', ${q(a.url)}, ${a.sortOrder}, 'draft')`,
    )
    .join(",\n"),
);
w("on conflict (slug) do update set");
w("  name        = excluded.name,");
w("  short_name  = excluded.short_name,");
w("  kind        = excluded.kind,");
w("  region      = excluded.region,");
w("  website_url = excluded.website_url;");
w();

w("-- Produce ------------------------------------------------------------------");
w(
  "insert into produce_items (slug, name, also_known_as, category_id, summary, cleaning_guidance, season_note, image_path, image_alt, site_risk_level, status) values",
);
w(
  [...produce.values()]
    .map(
      (p) =>
        `  (${qs(p.slug)}, ${qs(p.name)}, ${arr(p.alsoKnownAs)}, ` +
        `${p.categorySlug ? `(select id from produce_categories where slug = ${qs(p.categorySlug)})` : "null"}, ` +
        `${qs(p.summary)}, ${qs(p.cleaningGuidance)}, ${qs(p.seasonNote)}, ${q(p.image)}, ${qs(p.imageAlt)}, ` +
        `${p.siteRiskLevel ?? "null"}, 'draft')`,
    )
    .join(",\n"),
);
w("on conflict (slug) do update set");
w("  name              = excluded.name,");
w("  also_known_as     = excluded.also_known_as,");
w("  category_id       = excluded.category_id,");
w("  summary           = excluded.summary,");
w("  cleaning_guidance = excluded.cleaning_guidance,");
w("  season_note       = excluded.season_note,");
w("  image_path        = coalesce(excluded.image_path, produce_items.image_path),");
w("  image_alt         = excluded.image_alt,");
w("  site_risk_level   = excluded.site_risk_level;");
w();

w("-- Positions ----------------------------------------------------------------");
w(
  "insert into rulings (produce_id, authority_id, risk_level, guidance, citation, source_url, effective_date, notes, status) values",
);
w(
  positions
    .map(
      (p) =>
        `  ((select id from produce_items where slug = ${qs(p.produceSlug)}), ` +
        `(select id from authorities where slug = ${qs(p.authoritySlug)}), ` +
        `${p.level}, ${qs(p.guidance)}, ${qs(p.citation)}, ${q(p.sourceUrl)}, ` +
        `${p.effectiveDate ? `${qs(p.effectiveDate)}::date` : "null"}, ${qs(p.notes)}, 'draft')`,
    )
    .join(",\n"),
);
w("on conflict (produce_id, authority_id) do update set");
w("  risk_level     = excluded.risk_level,");
w("  guidance       = excluded.guidance,");
w("  citation       = excluded.citation,");
w("  source_url     = excluded.source_url,");
w("  effective_date = excluded.effective_date,");
w("  notes          = excluded.notes;");
w();
w("commit;");
w();

const target = resolve("supabase/import.sql");
writeFileSync(target, lines.join("\n"), "utf8");

console.log(`\nWrote ${target}`);
console.log(
  `  ${produce.size} produce items, ${positions.length} positions, ` +
    `${authorities.size} authorities, ${categories.size} categories — all as drafts.`,
);

if (unsourced.length > 0) {
  console.log(
    `\n  ${unsourced.length} position${unsourced.length > 1 ? "s have" : " has"} no citation and no source_url.`,
  );
  console.log("  Each item page will show the position with nothing to attribute it to:");
  for (const p of unsourced.slice(0, 10)) console.log(`    line ${p.line}`);
  if (unsourced.length > 10) console.log(`    …and ${unsourced.length - 10} more`);
  console.log("  Re-run with --strict-sources to treat this as an error.");
}

if (images.size > 0) {
  console.log(`\n  ${images.size} image path${images.size > 1 ? "s" : ""} referenced. Confirm each exists in the`);
  console.log("  produce-images bucket, or the item falls back to its category glyph:");
  for (const image of [...images].sort()) console.log(`    ${image}`);
}

console.log("\nLoad it with:");
console.log("  npx supabase db execute --file supabase/import.sql");
console.log("\nThen approve what you have reviewed in /admin. Nothing is public until you do.\n");
