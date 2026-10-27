-- New, isolated tables: the existing Prisma app is unaffected.
create table public.tradebook_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id)
);
alter table public.tradebook_owner enable row level security;
revoke all on public.tradebook_owner from anon, authenticated;
grant select on public.tradebook_owner to authenticated;
create policy owner_identity on public.tradebook_owner for select to authenticated
using (user_id = (select auth.uid()));

create table public.tradebook_journals (
  user_id uuid primary key references auth.users(id),
  revision integer not null check (revision > 0),
  state jsonb not null check (octet_length(state::text) <= 1600000),
  updated_at timestamptz not null default now()
);
alter table public.tradebook_journals enable row level security;
revoke all on public.tradebook_journals from anon, authenticated;
grant select, insert, update on public.tradebook_journals to authenticated;
create policy journal_read on public.tradebook_journals for select to authenticated
using (user_id = (select auth.uid()) and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())));
create policy journal_insert on public.tradebook_journals for insert to authenticated
with check (user_id = (select auth.uid()) and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())));
create policy journal_update on public.tradebook_journals for update to authenticated
using (user_id = (select auth.uid()) and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())))
with check (user_id = (select auth.uid()) and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('tradebook-charts','tradebook-charts',false,4194304,array['image/png','image/jpeg','image/webp']);
create policy tradebook_chart_read on storage.objects for select to authenticated
using (bucket_id = 'tradebook-charts' and (storage.foldername(name))[1] = (select auth.uid())::text and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())));
create policy tradebook_chart_insert on storage.objects for insert to authenticated
with check (bucket_id = 'tradebook-charts' and (storage.foldername(name))[1] = (select auth.uid())::text and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())));
create policy tradebook_chart_update on storage.objects for update to authenticated
using (bucket_id = 'tradebook-charts' and (storage.foldername(name))[1] = (select auth.uid())::text and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())))
with check (bucket_id = 'tradebook-charts' and (storage.foldername(name))[1] = (select auth.uid())::text and exists(select 1 from public.tradebook_owner where user_id = (select auth.uid())));
