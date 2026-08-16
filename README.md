# Tolaim

A public reference for insect inspection in fruit, vegetables and herbs. Someone
standing at a supermarket shelf should be able to look up what they are holding
and get three things in about ten seconds: whether it needs checking, how serious
it is, and what to do about it.

Next.js (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel.

---

## Running it

```bash
npm install
npm run dev
```

That is the whole setup. With no environment variables the site serves a bundled
sample dataset (40 produce items, 5 authorities, 114 positions, 5 rabbis,
5 alerts) so a fresh clone is a working site immediately. The admin panel needs a
real Supabase project — see below.

| Command             | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Development server on http://localhost:3000                |
| `npm run build`     | Production build                                           |
| `npm run typecheck` | `tsc --noEmit`                                             |
| `npm run seed:gen`  | Regenerates `supabase/seed.sql` from the sample dataset    |
| `npm run import`    | Turns a CSV of real data into `supabase/import.sql`       |

---

## Supabase setup

Nothing here has been run against a live project — the migrations, policies and
seed are written to be applied as they stand.

### 1. Create the project

Create a project at [supabase.com](https://supabase.com). From
**Project Settings → API** copy the project URL and the `anon` public key.

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable                        | Required | What it is                                                    |
| ------------------------------- | -------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | `https://<project-ref>.supabase.co`                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | The `anon` public key. Safe in the browser — RLS is the guard. |
| `NEXT_PUBLIC_SITE_URL`          | yes      | Absolute origin, for canonical URLs, sitemap and robots        |
| `SUPABASE_SERVICE_ROLE_KEY`     | no       | Server-only. Nothing currently needs it. Leave unset.          |

Set the same three in Vercel under **Settings → Environment Variables**.

### 3. Run the migrations

In order. Either paste each file into the SQL editor, or use the CLI:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

| File                                          | What it creates                                        |
| --------------------------------------------- | ------------------------------------------------------ |
| `supabase/migrations/…_init.sql`              | Tables, enums, the risk-level domain, triggers         |
| `supabase/migrations/…_rls.sql`               | Row Level Security policies                            |
| `supabase/migrations/…_storage.sql`           | The `produce-images` bucket and its policies           |

### 4. Load the sample data (optional)

```bash
npx supabase db execute --file supabase/seed.sql
```

Everything it inserts is marked approved, so the public site works straight
away. **It is sample content, not a halachic source** — every authority, rabbi,
ruling and alert in it is invented, with deliberately generic institution names
so nothing can be mistaken for a real published position. Clear it before
launch:

```sql
delete from alerts; delete from rulings; delete from rabbis;
delete from authorities; delete from produce_items;
```

### 5. Import real data

`supabase/seed.sql` is invented sample content. To load real data instead, put
it in a CSV and run:

```bash
npm run import -- data/produce.csv
npx supabase db execute --file supabase/import.sql
```

`data/produce.example.csv` is a filled-in template. One row per **position** —
that is, per (produce item × authority) — with the produce-level columns
repeated on each of that item's rows. Only three columns are required:
`produce`, `authority`, `risk_level`. `risk_level` accepts either `1`–`5` or the
exact label (`Expert checking`). The full column list is documented at the top
of `scripts/import-produce.mjs`.

Two things the importer does on purpose:

- **Everything arrives as a draft.** A bulk import is exactly the case where the
  review step matters, so nothing is public until it is approved in `/admin`.
- **Re-running is safe.** Rows match on slug and update in place, and approval
  state on existing rows is left alone, so a second import never silently
  unpublishes something that has already been reviewed.

It refuses to write a partial file: bad rows are reported with their line
numbers and nothing is emitted until they are fixed.

**Attribution.** When positions come from another organisation's published
guidance, the citation and the link back are the basis on which they are being
reported at all — so fill in `citation` and `source_url` on every row. The
importer lists any position that has neither, and `--strict-sources` turns that
into an error:

```bash
npm run import -- data/produce.csv --strict-sources
```

Item pages render the citation under each position and the `source_url` as a
"Source" link, and both survive into the printed page.

Images are not uploaded by the importer. Put the files in the `produce-images`
bucket and reference the object path in the `image` column; the run prints every
path it referenced so you can check them. Any item without one falls back to its
category glyph.

### 6. Create the first admin

There is no signup anywhere on this site. Accounts are made by hand.

1. **Authentication → Users → Add user**, with a password. Tick *auto-confirm*.
2. Copy the new user's UUID.
3. In the SQL editor:

```sql
insert into admin_users (id, email, display_name, role)
values ('<user-uuid>', 'you@example.com', 'Your Name', 'admin');
```

Being an auth user is not enough — the row in `admin_users` is what grants
access. Then go to `/admin` and sign in.

### 7. Turn off public signup

**Authentication → Providers → Email**: disable *Enable sign ups*. Belt and
braces, since nothing in the app offers it.

---

## How it is put together

### The data model

A produce item does not have a ruling. It has many — one per authority, each
with its own risk level, guidance and citation.

```
produce_items ──< rulings >── authorities
                                  │
rabbis ──default_authority────────┤
   └──< rabbi_authority_overrides ┘        ("follows X, except on lettuce")

alerts ──< alert_produce >── produce_items
approval_events                            (append-only review history)
```

`produce_items.site_risk_level` is an authored editorial summary that is
**never** computed from the rulings — deriving a consensus in code would put the
site in the position of deciding a halachic question, which it does not do. Item
pages show the summary, the range across authorities, and every position
individually.

### Draft visibility

Anonymous visitors can read approved content only, and that is enforced in the
database, not the front end. The `anon` role's `SELECT` policies filter on
`status = 'approved'`; there is no `anon` write policy anywhere. A ruling is
additionally invisible unless the produce item *and* the authority it joins are
both approved, so approving an item cannot accidentally publish a draft position
attributed to a named rabbi.

`approval_events` has `SELECT` and `INSERT` policies and no `UPDATE` or
`DELETE` — the review history cannot be rewritten through the API.

### The admin

`/admin`, reachable only by typing it. Nothing in the public site links to it:
no header login, no footer link, no nav hint. It is `noindex, nofollow` in its
layout, `X-Robots-Tag`-headered in middleware, and disallowed in `robots.txt`.

Middleware on `/admin/:path*` refreshes the session cookie; it does not decide
access. Every admin page and every server action checks membership of
`admin_users` for itself, and RLS is the real boundary.

### The risk scale

Five fixed levels, defined once in `src/lib/risk.ts` and imported everywhere —
labels are never re-worded in components.

| Level | Label           | Meaning                            |
| ----- | --------------- | ---------------------------------- |
| 1     | Not recommended | Cannot be cleaned at all           |
| 2     | Expert checking | Cleanable, needs expertise         |
| 3     | Home checking   | Cleanable at home                  |
| —     | —               | *above this line, inspection is required* |
| 4     | Rinse only      | A basic rinse                      |
| 5     | No checking     | Nothing needed                     |

Every badge renders the five-slot gauge and links to `/risk-levels`. Level 1
draws as a struck, hatched block rather than a full gauge, because "cannot be
cleaned" is not the far end of an effort ramp. Slot count, the notch between
levels 3 and 4, and the hatch all survive a black-and-white photocopy, which
matters because these pages get printed for kitchen walls and bulletin boards.

### Search

The listing ships the whole index in the page and searches it in the browser
(`src/lib/search.ts`) — no round trip, instant on the first keystroke, and it
keeps working on a bad connection, which is the actual condition in a
supermarket aisle. At a few hundred items the payload is small; past a few
thousand this would want revisiting.

### "My rabbi"

A visitor picks their rabbi once and the position that applies to them is
surfaced first everywhere. The choice lives in `localStorage` and nowhere else —
there are no public user accounts on this site and nothing is sent to the
server. If their rabbi's authority has published nothing on an item, the page
says so rather than quietly showing someone else's position.

### Cleaning methods

Hardcoded in `src/content/cleaning-methods.ts`, not database-driven. They change
rarely, need reviewing as a set, and carry a prerequisite hierarchy that is
shown as a path diagram on the index and as "this method assumes" on each page.
Nothing is locked — a reader arriving mid-task from a produce page goes straight
to what they need.

### Images

Produce photographs live in the `produce-images` bucket and are set per item in
the admin (`image_path`). Until one is uploaded, each item renders a drawn
specimen glyph chosen by category — quiet, consistent, and still scannable.
Method diagrams are inline SVG for the same reason: they weigh nothing and
photocopy cleanly.

### Caching

Produce, alerts and the legend are statically generated and revalidate on a
timer (5 minutes; 1 minute for the alerts feed). Admin mutations call
`revalidatePath` so a publish is visible immediately rather than on the next
tick.

---

## Project layout

```
src/
  app/                     routes — public at the root, admin under /admin
  components/              shared UI; components/admin/ is admin-only
  content/cleaning-methods.ts
  lib/
    risk.ts                the five levels, defined once
    search.ts              client-side search
    my-rabbi.tsx           localStorage rabbi choice
    data/                  public read layer + the sample dataset
    admin/                 admin reads, server actions, auth
    supabase/              clients and database types
supabase/
  migrations/              schema, RLS, storage
  seed.sql                 generated — see npm run seed:gen
scripts/generate-seed.mjs
```

## Before launch

- [ ] Replace the sample dataset with reviewed content
- [ ] Disable public signup in Supabase auth settings
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real origin
- [ ] Upload produce photographs
- [ ] Confirm `/admin` appears in no sitemap, nav or footer (it does not today)
