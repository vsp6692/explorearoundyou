-- Run by auth-schema.mjs against a disposable local cluster, not a production project.
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
insert into public.explorer_profiles(id) values(auth.uid());
select public.record_explorer_search('Unsaved search','Food');
do $$begin
 if exists(select from public.explorer_searches) then raise exception 'Default consent must be off'; end if;
end$$;
update public.explorer_profiles set display_name='Explorer A',history_enabled=true where id=auth.uid();
select public.record_explorer_search('Cafés within 3 km','Food');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
do $$begin
 if exists(select from public.explorer_profiles) or exists(select from public.explorer_searches) then raise exception 'Cross-user read'; end if;
 begin
  insert into public.explorer_profiles(id) values('00000000-0000-0000-0000-000000000001');
  raise exception 'Cross-user profile insert accepted';
 exception when insufficient_privilege then null; end;
end$$;
update public.explorer_profiles set display_name='Attacker';
delete from public.explorer_searches;
insert into public.explorer_profiles(id,history_enabled) values(auth.uid(),true);
do $$begin
 begin
  insert into public.explorer_searches(user_id,query) values(auth.uid(),'Bypass consent');
  raise exception 'Direct history insert accepted';
 exception when insufficient_privilege then null; end;
end$$;
select public.record_explorer_search('Park walk','Parks');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
do $$begin
 if (select count(*) from public.explorer_searches)<>1 then raise exception 'Cross-user deletion'; end if;
 if (select display_name from public.explorer_profiles)<>'Explorer A' then raise exception 'Cross-user update'; end if;
 for n in 1..110 loop perform public.record_explorer_search('Search '||n,'Food'); end loop;
 if (select count(*) from public.explorer_searches)<>100 then raise exception 'History cap failed'; end if;
 begin
  perform public.record_explorer_search('Invalid','Unsupported');
  raise exception 'Unsupported category accepted';
 exception when check_violation then null; end;
 begin
  perform public.record_explorer_search(repeat('x',201),'Food');
  raise exception 'Oversize query accepted';
 exception when raise_exception then
  if sqlerrm<>'Invalid search' then raise; end if;
 end;
end$$;
update public.explorer_profiles set history_enabled=false where id=auth.uid();
select public.record_explorer_search('Should not be saved','Food');
do $$begin
 if exists(select from public.explorer_searches where query='Should not be saved') then raise exception 'Revoked consent ignored'; end if;
end$$;
delete from public.explorer_searches;
reset role;
do $$begin
 if (select count(*) from public.explorer_searches)<>1 then raise exception 'History deletion damaged other account'; end if;
end$$;
insert into public.explorer_searches(user_id,query,created_at) values('00000000-0000-0000-0000-000000000001','Expired',now()-interval '91 days');
set role authenticated;
do $$begin
 if exists(select from public.explorer_searches) then raise exception 'Expired rows visible'; end if;
end$$;
update public.explorer_profiles set history_enabled=true where id=auth.uid();
select public.record_explorer_search('Fresh','Parks');
reset role;
do $$begin
 if exists(select from public.explorer_searches where query='Expired') then raise exception 'Expiry pruning failed'; end if;
end$$;
set role anon;
select set_config('request.jwt.claim.sub','',false);
do $$begin
 begin
  perform * from public.explorer_profiles;
  raise exception 'Anonymous profile access';
 exception when insufficient_privilege then null; end;
 begin
  perform public.record_explorer_search('Anonymous','Food');
  raise exception 'Anonymous history write';
 exception when insufficient_privilege then null; end;
end$$;
reset role;
