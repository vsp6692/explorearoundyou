-- Apply once in your own Supabase project. Never use a service-role key in the browser.
begin;
create table public.explorer_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Explorer' check (char_length(display_name) between 1 and 60),
 history_enabled boolean not null default false,
 interests text[] not null default '{}' constraint explorer_profiles_interests_check check (
  cardinality(interests)<=7 and array_position(interests,null) is null and
  interests <@ array['Food','Stays','Beaches','Parks','Attractions','Shopping','Fun']::text[]
 )
);
create table public.explorer_searches (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.explorer_profiles(id) on delete cascade,
 query text not null check (char_length(query) between 1 and 200),
 category text check (category in ('Food','Stays','Beaches','Parks','Attractions','Shopping','Fun')),
 created_at timestamptz not null default now()
);
create index explorer_searches_owner_time on public.explorer_searches(user_id,created_at desc);
alter table public.explorer_profiles enable row level security;
alter table public.explorer_searches enable row level security;
revoke all on public.explorer_profiles,public.explorer_searches from anon,authenticated;
grant select,insert,update on public.explorer_profiles to authenticated;
grant select,delete on public.explorer_searches to authenticated;
create policy own_profile_read on public.explorer_profiles for select to authenticated using ((select auth.uid())=id);
create policy own_profile_insert on public.explorer_profiles for insert to authenticated with check ((select auth.uid())=id);
create policy own_profile_update on public.explorer_profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy own_history_read on public.explorer_searches for select to authenticated using ((select auth.uid())=user_id and created_at>now()-interval '90 days');
create policy own_history_delete on public.explorer_searches for delete to authenticated using ((select auth.uid())=user_id);
create function public.record_explorer_search(search_query text,search_category text default null)
returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid := auth.uid(); enabled boolean;
begin
 if owner_id is null then raise exception 'Authentication required'; end if;
 select history_enabled into enabled from public.explorer_profiles where id=owner_id for update;
 if enabled is distinct from true then return; end if;
 if char_length(trim(search_query)) not between 1 and 200 then raise exception 'Invalid search'; end if;
 insert into public.explorer_searches(user_id,query,category) values(owner_id,trim(search_query),search_category);
 delete from public.explorer_searches where user_id=owner_id and (created_at<=now()-interval '90 days' or id in (select id from public.explorer_searches where user_id=owner_id order by created_at desc,id desc offset 100));
end $$;
revoke all on function public.record_explorer_search(text,text) from public,anon;
grant execute on function public.record_explorer_search(text,text) to authenticated;
commit;
-- Schedule the following daily in Supabase Cron to physically purge expired inactive history:
-- delete from public.explorer_searches where created_at <= now() - interval '90 days';
