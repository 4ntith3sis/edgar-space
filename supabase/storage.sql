-- =====================================================================
-- Edgar Space — Supabase Storage buckets + policies
-- Run once in Supabase Dashboard → SQL Editor (project's own database).
-- Buckets: products | categories | banners (all PUBLIC for read)
-- Writes/deletes happen ONLY via SUPABASE_SERVICE_ROLE_KEY (server-side),
-- which bypasses RLS. Anonymous users get read-only access.
-- =====================================================================

-- 1. Buckets (idempotent)
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('banners', 'banners', true)
on conflict (id) do update set public = true;

-- 2. Public read policies (one per bucket)
drop policy if exists "Public read products" on storage.objects;
create policy "Public read products"
on storage.objects for select
using (bucket_id = 'products');

drop policy if exists "Public read categories" on storage.objects;
create policy "Public read categories"
on storage.objects for select
using (bucket_id = 'categories');

drop policy if exists "Public read banners" on storage.objects;
create policy "Public read banners"
on storage.objects for select
using (bucket_id = 'banners');

-- 3. No INSERT / UPDATE / DELETE policies for anon/authenticated on purpose:
--    all privileged object operations run server-side with the service role
--    key (libs: server/utils/storage.js). Do NOT add public write policies.

-- 4. Verify
select id, name, public from storage.buckets where id in ('products', 'categories', 'banners');
select policyname, cmd from pg_policies where schemaname = 'storage' and tablename = 'objects';
