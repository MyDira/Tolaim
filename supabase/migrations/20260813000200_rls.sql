-- ===========================================================================
-- Tolaim — Row Level Security
-- ===========================================================================
-- The rule, stated once: anonymous visitors can read approved content only.
-- No front-end bug can expose a draft, because the database will not return
-- one. Writes are admin-only, everywhere, with no exceptions.
--
-- Note on `authenticated`: the only authenticated users that exist are the
-- hand-created rows in admin_users. There is no public signup. Policies still
-- check is_admin() rather than trusting `authenticated`, so an auth user
-- created by accident (or by a future Supabase feature) has no more access
-- than an anonymous visitor.
-- ===========================================================================

alter table admin_users               enable row level security;
alter table produce_categories        enable row level security;
alter table produce_items             enable row level security;
alter table authorities               enable row level security;
alter table rulings                   enable row level security;
alter table rabbis                    enable row level security;
alter table rabbi_authority_overrides enable row level security;
alter table alerts                    enable row level security;
alter table alert_produce             enable row level security;
alter table approval_events           enable row level security;

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
-- An admin can see the roster (needed to render "approved by" names) but
-- cannot edit it. Adding or removing an admin is done in the Supabase
-- dashboard on purpose — it is not a self-service operation.

create policy "admins read the roster"
  on admin_users for select
  to authenticated
  using (is_admin());

-- ---------------------------------------------------------------------------
-- Reference data that is not itself reviewed
-- ---------------------------------------------------------------------------

create policy "anyone reads categories"
  on produce_categories for select
  to anon, authenticated
  using (true);

create policy "admins write categories"
  on produce_categories for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------------
-- produce_items
-- ---------------------------------------------------------------------------

create policy "anon reads approved produce"
  on produce_items for select
  to anon
  using (status = 'approved');

create policy "admins read all produce"
  on produce_items for select
  to authenticated
  using (is_admin());

create policy "admins write produce"
  on produce_items for insert
  to authenticated
  with check (is_admin());

create policy "admins update produce"
  on produce_items for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admins delete produce"
  on produce_items for delete
  to authenticated
  using (is_admin());

-- ---------------------------------------------------------------------------
-- authorities
-- ---------------------------------------------------------------------------

create policy "anon reads approved authorities"
  on authorities for select
  to anon
  using (status = 'approved');

create policy "admins read all authorities"
  on authorities for select
  to authenticated
  using (is_admin());

create policy "admins write authorities"
  on authorities for insert
  to authenticated
  with check (is_admin());

create policy "admins update authorities"
  on authorities for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admins delete authorities"
  on authorities for delete
  to authenticated
  using (is_admin());

-- ---------------------------------------------------------------------------
-- rulings
-- ---------------------------------------------------------------------------
-- A ruling is only visible when the ruling itself is approved AND both of the
-- records it joins are approved. Approving a produce item therefore cannot
-- accidentally publish a draft position attributed to a named rabbi, which is
-- the failure mode that actually matters here.

create policy "anon reads approved rulings"
  on rulings for select
  to anon
  using (
    status = 'approved'
    and exists (select 1 from produce_items p where p.id = produce_id   and p.status = 'approved')
    and exists (select 1 from authorities   a where a.id = authority_id and a.status = 'approved')
  );

create policy "admins read all rulings"
  on rulings for select
  to authenticated
  using (is_admin());

create policy "admins write rulings"
  on rulings for insert
  to authenticated
  with check (is_admin());

create policy "admins update rulings"
  on rulings for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admins delete rulings"
  on rulings for delete
  to authenticated
  using (is_admin());

-- ---------------------------------------------------------------------------
-- rabbis
-- ---------------------------------------------------------------------------

create policy "anon reads approved rabbis"
  on rabbis for select
  to anon
  using (status = 'approved');

create policy "admins read all rabbis"
  on rabbis for select
  to authenticated
  using (is_admin());

create policy "admins write rabbis"
  on rabbis for insert
  to authenticated
  with check (is_admin());

create policy "admins update rabbis"
  on rabbis for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admins delete rabbis"
  on rabbis for delete
  to authenticated
  using (is_admin());

-- ---------------------------------------------------------------------------
-- rabbi_authority_overrides
-- ---------------------------------------------------------------------------
-- Visible only when the rabbi it belongs to is visible.

create policy "anon reads overrides of approved rabbis"
  on rabbi_authority_overrides for select
  to anon
  using (exists (select 1 from rabbis r where r.id = rabbi_id and r.status = 'approved'));

create policy "admins read all overrides"
  on rabbi_authority_overrides for select
  to authenticated
  using (is_admin());

create policy "admins write overrides"
  on rabbi_authority_overrides for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
-- Approved and published. Expired alerts stay readable — the archive is
-- public — but an alert scheduled for next Tuesday is not.

create policy "anon reads published alerts"
  on alerts for select
  to anon
  using (status = 'approved' and published_at <= now());

create policy "admins read all alerts"
  on alerts for select
  to authenticated
  using (is_admin());

create policy "admins write alerts"
  on alerts for insert
  to authenticated
  with check (is_admin());

create policy "admins update alerts"
  on alerts for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admins delete alerts"
  on alerts for delete
  to authenticated
  using (is_admin());

-- ---------------------------------------------------------------------------
-- alert_produce
-- ---------------------------------------------------------------------------

create policy "anon reads links of published alerts"
  on alert_produce for select
  to anon
  using (
    exists (select 1 from alerts a where a.id = alert_id and a.status = 'approved' and a.published_at <= now())
    and exists (select 1 from produce_items p where p.id = produce_id and p.status = 'approved')
  );

create policy "admins read all alert links"
  on alert_produce for select
  to authenticated
  using (is_admin());

create policy "admins write alert links"
  on alert_produce for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------------
-- approval_events
-- ---------------------------------------------------------------------------
-- Internal review history. Never public. Append-only: no update or delete
-- policy exists, so even an admin cannot rewrite it through the API.

create policy "admins read history"
  on approval_events for select
  to authenticated
  using (is_admin());

create policy "admins append history"
  on approval_events for insert
  to authenticated
  with check (is_admin());
