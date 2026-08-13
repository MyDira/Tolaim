-- ===========================================================================
-- Tolaim — storage
-- ===========================================================================
-- One public bucket for produce photographs and authority logos. Public read
-- (the images are on public pages and benefit from CDN caching), admin write.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produce-images',
  'produce-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "anyone reads produce images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'produce-images');

create policy "admins upload produce images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produce-images' and is_admin());

create policy "admins update produce images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produce-images' and is_admin())
  with check (bucket_id = 'produce-images' and is_admin());

create policy "admins delete produce images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produce-images' and is_admin());
