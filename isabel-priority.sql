-- Rename the existing roaming profile. Keep both owners, device links and
-- study-state rows intact. The prior private Isabel profile retains its login
-- on remembered devices under its new name: Isabel (previous).
begin;
lock table public.study_profiles in share row exclusive mode;

do $$
declare priority_id uuid; previous_id uuid; changed integer;
begin
 select p.user_id into strict priority_id from public.study_profiles p
 join public.study_shared_profiles s on s.profile_id=p.user_id and s.enabled
 where p.normalized_username='elaine';
 select p.user_id into strict previous_id from public.study_profiles p
 where p.normalized_username='isabel' and not exists (
  select 1 from public.study_shared_profiles s where s.profile_id=p.user_id and s.enabled
 );
 if priority_id=previous_id or exists (
  select 1 from public.study_profiles where normalized_username='isabel (previous)'
 ) then raise exception 'Cannot rename: reserved profile names do not match the expected state';end if;

 update public.study_profiles set username='Isabel (previous)' where user_id=previous_id;
 get diagnostics changed=row_count;
 if changed<>1 then raise exception 'Previous Isabel profile did not move';end if;
 update public.study_profiles set username='Isabel' where user_id=priority_id;
 get diagnostics changed=row_count;
 if changed<>1 then raise exception 'Priority profile did not rename';end if;
end;
$$;

select p.username,p.user_id as profile_id,coalesce(sp.enabled,false) as shared,s.revision,
 md5(coalesce(s.data::text,'')) as state_fingerprint
 from public.study_profiles p
 left join public.study_shared_profiles sp on sp.profile_id=p.user_id
 left join public.study_states s on s.user_id=p.user_id
 where p.normalized_username in ('isabel','isabel (previous)')
 order by p.normalized_username;
commit;
