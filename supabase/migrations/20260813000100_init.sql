-- ===========================================================================
-- Tolaim — core schema
-- ===========================================================================
-- Public reference site for insect-infestation concerns in produce.
--
-- Shape of the model: a produce item does NOT have a ruling. It has many
-- rulings, one per authority, each with its own risk level, guidance and
-- citation. `produce_items.site_risk_level` is a separately authored and
-- separately approved editorial summary — it is never computed from the
-- rulings, because computing it would put the site in the position of
-- deciding a halachic question rather than reporting positions.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared enums
-- ---------------------------------------------------------------------------

-- Every content table moves through the same two states. `approved` is the
-- rabbinic review step and is the only state anonymous visitors can read.
create type content_status as enum ('draft', 'approved');

create type authority_kind as enum ('organization', 'posek', 'publication');

create type alert_severity as enum ('info', 'advisory', 'urgent');

create type admin_role as enum ('admin', 'reviewer');

create type approval_action as enum ('created', 'updated', 'submitted', 'approved', 'unapproved');

-- ---------------------------------------------------------------------------
-- Risk scale
-- ---------------------------------------------------------------------------
-- Five fixed levels, used identically everywhere the scale appears:
--
--   1  Not recommended  — cannot be cleaned at all
--   2  Expert checking  — can be cleaned, but requires expertise or skill
--   3  Home checking    — can be cleaned at home
--   ------------------- the line: above it inspection is required ----------
--   4  Rinse only       — basic rinse
--   5  No checking      — nothing needed
--
-- Level 1 is a categorically different statement from 2-5, which form an
-- effort ramp. Labels live in one place in the app (src/lib/risk.ts); the
-- database only enforces the domain.
create domain risk_level as smallint
  check (value between 1 and 5);

-- ---------------------------------------------------------------------------
-- Admin users
-- ---------------------------------------------------------------------------
-- There are no public user accounts anywhere on this site. Every row here is
-- created by hand (see README) and maps 1:1 to a Supabase auth user.

create table admin_users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text        not null,
  display_name text        not null default '',
  role         admin_role  not null default 'admin',
  created_at   timestamptz not null default now()
);

comment on table admin_users is
  'Allow-list of users who may sign in to /admin. Presence in this table is what grants access; there is no public signup.';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER so RLS policies on admin_users cannot recurse into
-- themselves. search_path is pinned per Supabase linter guidance.

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Produce
-- ---------------------------------------------------------------------------

create table produce_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  sort_order smallint not null default 100
);

create table produce_items (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  also_known_as     text[] not null default '{}',
  category_id       uuid references produce_categories (id) on delete set null,

  -- The ten-second answer. One sentence, plain language.
  summary           text not null default '',
  -- What to actually do. Markdown.
  cleaning_guidance text not null default '',
  -- Seasonal / regional caveat, if any.
  season_note       text not null default '',

  -- Storage object path inside the `produce-images` bucket, e.g. 'lettuce.jpg'.
  image_path        text,
  image_alt         text not null default '',

  -- Authored editorial summary of the overall picture. Nullable: an item may
  -- legitimately have no single site-level answer.
  site_risk_level   risk_level,

  status            content_status not null default 'draft',
  approved_by       uuid references auth.users (id) on delete set null,
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- An approved item must carry the approval metadata that goes with it.
  constraint produce_items_approval_complete
    check (status <> 'approved' or approved_at is not null)
);

create index produce_items_status_idx   on produce_items (status);
create index produce_items_category_idx on produce_items (category_id);

create trigger produce_items_updated_at
  before update on produce_items
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Authorities and their rulings
-- ---------------------------------------------------------------------------

create table authorities (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  short_name  text not null default '',
  kind        authority_kind not null default 'organization',
  region      text not null default '',
  description text not null default '',
  website_url text,
  logo_path   text,
  sort_order  smallint not null default 100,

  status      content_status not null default 'draft',
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint authorities_approval_complete
    check (status <> 'approved' or approved_at is not null)
);

create trigger authorities_updated_at
  before update on authorities
  for each row execute function set_updated_at();

create table rulings (
  id             uuid primary key default gen_random_uuid(),
  produce_id     uuid not null references produce_items (id) on delete cascade,
  authority_id   uuid not null references authorities   (id) on delete cascade,

  risk_level     risk_level not null,
  guidance       text not null default '',
  -- Human-readable citation, e.g. 'Sefer Bedikas HaMazon 2nd ed., p. 114'.
  citation       text not null default '',
  source_url     text,
  -- When this authority published or last restated the position.
  effective_date date,
  notes          text not null default '',

  status         content_status not null default 'draft',
  approved_by    uuid references auth.users (id) on delete set null,
  approved_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (produce_id, authority_id),
  constraint rulings_approval_complete
    check (status <> 'approved' or approved_at is not null)
);

comment on table rulings is
  'One authority''s position on one produce item. This is where risk levels actually live.';

create index rulings_produce_idx   on rulings (produce_id);
create index rulings_authority_idx on rulings (authority_id);

create trigger rulings_updated_at
  before update on rulings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Rabbis
-- ---------------------------------------------------------------------------
-- Most community members follow a particular rabbi, and that rabbi in turn
-- follows a particular expert — usually across the board, sometimes
-- differently for specific produce.

create table rabbis (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  community            text not null default '',
  region               text not null default '',
  description          text not null default '',
  -- Who this rabbi follows when there is no item-specific override.
  default_authority_id uuid references authorities (id) on delete set null,

  status      content_status not null default 'draft',
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint rabbis_approval_complete
    check (status <> 'approved' or approved_at is not null)
);

create trigger rabbis_updated_at
  before update on rabbis
  for each row execute function set_updated_at();

-- 'Follows the OU across the board, except on strawberries.'
create table rabbi_authority_overrides (
  id           uuid primary key default gen_random_uuid(),
  rabbi_id     uuid not null references rabbis        (id) on delete cascade,
  produce_id   uuid not null references produce_items (id) on delete cascade,
  authority_id uuid not null references authorities   (id) on delete cascade,
  note         text not null default '',
  created_at   timestamptz not null default now(),

  unique (rabbi_id, produce_id)
);

create index rabbi_overrides_rabbi_idx on rabbi_authority_overrides (rabbi_id);

-- ---------------------------------------------------------------------------
-- Alerts
-- ---------------------------------------------------------------------------
-- Infestation levels change by season, region and growing conditions.
-- Expired alerts move to a public archive; they are never deleted.

create table alerts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  -- Short line used in the alert strip and on affected produce pages.
  summary      text not null default '',
  -- Markdown.
  body         text not null default '',
  severity     alert_severity not null default 'advisory',
  region       text not null default '',
  published_at timestamptz not null default now(),
  expires_at   timestamptz,

  status       content_status not null default 'draft',
  approved_by  uuid references auth.users (id) on delete set null,
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint alerts_approval_complete
    check (status <> 'approved' or approved_at is not null),
  constraint alerts_expiry_after_publish
    check (expires_at is null or expires_at > published_at)
);

create index alerts_published_idx on alerts (published_at desc);
create index alerts_status_idx    on alerts (status);

create trigger alerts_updated_at
  before update on alerts
  for each row execute function set_updated_at();

create table alert_produce (
  alert_id   uuid not null references alerts        (id) on delete cascade,
  produce_id uuid not null references produce_items (id) on delete cascade,
  primary key (alert_id, produce_id)
);

create index alert_produce_produce_idx on alert_produce (produce_id);

-- ---------------------------------------------------------------------------
-- Approval history
-- ---------------------------------------------------------------------------
-- Append-only. The `approved_by` / `approved_at` columns above are the
-- denormalised current state for fast reads; this is the record that is kept.

create table approval_events (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('produce_item', 'ruling', 'authority', 'rabbi', 'alert')),
  entity_id   uuid not null,
  entity_label text not null default '',
  action      approval_action not null,
  actor_id    uuid references auth.users (id) on delete set null,
  -- Kept denormalised so history survives an admin being removed.
  actor_email text not null default '',
  note        text not null default '',
  created_at  timestamptz not null default now()
);

create index approval_events_entity_idx  on approval_events (entity_type, entity_id, created_at desc);
create index approval_events_created_idx on approval_events (created_at desc);
