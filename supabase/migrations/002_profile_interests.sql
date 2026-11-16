-- For projects that already applied the original schema. New installations use schema.sql.
alter table public.explorer_profiles add column if not exists interests text[] not null default '{}';
do $$begin
 if not exists(select from pg_constraint where conname='explorer_profiles_interests_check' and conrelid='public.explorer_profiles'::regclass) then
  alter table public.explorer_profiles add constraint explorer_profiles_interests_check check (
   cardinality(interests)<=7 and array_position(interests,null) is null and
   interests <@ array['Food','Stays','Beaches','Parks','Attractions','Shopping','Fun']::text[]
  );
 end if;
end$$;
