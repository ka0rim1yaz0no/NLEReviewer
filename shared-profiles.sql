-- Username-only roaming for explicitly shared study profiles.
-- The user accepts that anyone entering elaine can access that study profile.
-- Existing owner IDs and study-state JSON are never copied or reassigned.
begin;

create table if not exists public.study_shared_profiles (
 profile_id uuid primary key references public.study_profiles(user_id) on delete cascade,
 enabled boolean not null default true
);
create table if not exists public.study_profile_devices (
 device_user_id uuid primary key references auth.users(id) on delete cascade,
 profile_id uuid not null references public.study_profiles(user_id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.study_shared_profiles enable row level security;
alter table public.study_profile_devices enable row level security;
revoke all on public.study_shared_profiles,public.study_profile_devices from public,anon,authenticated;

insert into public.study_shared_profiles(profile_id,enabled)
 select user_id,true from public.study_profiles where normalized_username='elaine'
 on conflict(profile_id) do update set enabled=true;

create or replace function public.current_study_profile_id()
returns uuid language sql stable security definer set search_path=''
as $$
 select coalesce(
  (select p.user_id from public.study_profiles p where p.user_id=(select auth.uid())),
  (select d.profile_id from public.study_profile_devices d
   join public.study_shared_profiles s on s.profile_id=d.profile_id and s.enabled
   where d.device_user_id=(select auth.uid()))
 );
$$;
revoke all on function public.current_study_profile_id() from public,anon;
grant execute on function public.current_study_profile_id() to authenticated;

create or replace function public.read_study_identity()
returns table(profile_id uuid,username text,shared boolean)
language sql stable security definer set search_path=''
as $$
 select p.user_id,p.username,exists(select 1 from public.study_shared_profiles s where s.profile_id=p.user_id and s.enabled)
 from public.study_profiles p where p.user_id=(select public.current_study_profile_id());
$$;
revoke all on function public.read_study_identity() from public,anon;
grant execute on function public.read_study_identity() to authenticated;

create or replace function public.open_shared_study_profile(p_username text)
returns table(profile_id uuid,username text,shared boolean)
language plpgsql security definer set search_path=''
as $$
declare actor uuid; target uuid; name text;
begin
 actor:=auth.uid();
 if actor is null then raise exception 'Sign in before opening a study profile' using errcode='42501';end if;
 if p_username is null or char_length(btrim(p_username)) not between 1 and 40 then raise exception 'Enter a valid username' using errcode='22023';end if;
 select p.user_id,p.username into target,name from public.study_profiles p
 join public.study_shared_profiles s on s.profile_id=p.user_id and s.enabled
 where p.normalized_username=lower(btrim(p_username));
 if target is null then return;end if;
 if exists(select 1 from public.study_profiles p where p.user_id=actor and p.user_id<>target)
 then raise exception 'Switch profiles before opening another username' using errcode='42501';end if;
 if actor<>target then
  insert into public.study_profile_devices(device_user_id,profile_id) values(actor,target) on conflict(device_user_id) do nothing;
  if not exists(select 1 from public.study_profile_devices d where d.device_user_id=actor and d.profile_id=target)
  then raise exception 'This device identity belongs to another profile' using errcode='42501';end if;
 end if;
 return query select target,name,true;
end;
$$;
revoke all on function public.open_shared_study_profile(text) from public,anon;
grant execute on function public.open_shared_study_profile(text) to authenticated;

drop policy if exists "Read own username profile" on public.study_profiles;
create policy "Read own username profile" on public.study_profiles for select to authenticated
 using(user_id=(select public.current_study_profile_id()));
drop policy if exists "Create own username profile" on public.study_profiles;
create policy "Create own username profile" on public.study_profiles for insert to authenticated
 with check(user_id=(select auth.uid()) and (select public.current_study_profile_id()) is null);

alter table public.study_states add column if not exists revision bigint not null default 0;
create table if not exists public.study_sync_receipts(
 profile_id uuid not null references public.study_profiles(user_id) on delete cascade,
 client_id uuid not null,
 sequence bigint not null check(sequence>0),
 primary key(profile_id,client_id)
);
alter table public.study_sync_receipts enable row level security;
revoke all on public.study_sync_receipts from public,anon,authenticated;
create or replace function public.bump_study_state_revision()
returns trigger language plpgsql set search_path=''
as $$begin
 new.revision:=case when tg_op='INSERT' then 1 else old.revision+1 end;
 new.updated_at:=clock_timestamp();return new;
end;$$;
revoke all on function public.bump_study_state_revision() from public,anon,authenticated;
drop trigger if exists study_state_revision on public.study_states;
create trigger study_state_revision before insert or update on public.study_states
 for each row execute function public.bump_study_state_revision();

drop policy if exists "Read own study state" on public.study_states;
create policy "Read own study state" on public.study_states for select to authenticated
 using(user_id=(select public.current_study_profile_id()));
-- Older clients may keep writing their private profile. Shared-profile writes
-- use the revision-checked RPC so an old tab cannot overwrite roaming progress.
drop policy if exists "Insert own study state" on public.study_states;
create policy "Insert own study state" on public.study_states for insert to authenticated
 with check(user_id=(select auth.uid()) and not exists(select 1 from public.read_study_identity() i where i.shared));
drop policy if exists "Update own study state" on public.study_states;
create policy "Update own study state" on public.study_states for update to authenticated
 using(user_id=(select auth.uid()) and not exists(select 1 from public.read_study_identity() i where i.shared))
 with check(user_id=(select auth.uid()) and not exists(select 1 from public.read_study_identity() i where i.shared));

create or replace function public.save_study_progress(p_profile_id uuid,p_expected_revision bigint,p_data jsonb,p_client_id uuid,p_sequence bigint)
returns table(saved boolean,profile_id uuid,revision bigint,data jsonb)
language plpgsql security definer set search_path=''
as $$
declare owner_id uuid; current_row public.study_states%rowtype; next_row public.study_states%rowtype;
begin
 owner_id:=public.current_study_profile_id();
 if owner_id is null or owner_id is distinct from p_profile_id
 then raise exception 'This study profile is not open in the current session' using errcode='42501';end if;
 if p_expected_revision is null or p_expected_revision<0 or p_client_id is null or p_sequence is null or p_sequence<1
 or p_data is null or jsonb_typeof(p_data) is distinct from 'object' or p_data->>'version' is distinct from '1'
 or jsonb_typeof(p_data->'profile') is distinct from 'object'
 or jsonb_typeof(p_data->'attempts') is distinct from 'array' or jsonb_typeof(p_data->'sessions') is distinct from 'array'
 or octet_length(p_data::text)>8000000
 then raise exception 'Invalid study progress payload' using errcode='22023';end if;
 select s.* into current_row from public.study_states s where s.user_id=owner_id for update;
 if found and exists(select 1 from public.study_sync_receipts r where r.profile_id=owner_id and r.client_id=p_client_id and r.sequence>=p_sequence)
 then return query select true,owner_id,current_row.revision,current_row.data;return;end if;
 if not found then
  if p_expected_revision<>0 then raise exception 'The saved profile changed; reconnect before saving' using errcode='40001';end if;
  insert into public.study_states as s(user_id,data) values(owner_id,p_data)
   on conflict(user_id) do nothing returning s.* into next_row;
  if found then
   insert into public.study_sync_receipts(profile_id,client_id,sequence) values(owner_id,p_client_id,p_sequence)
    on conflict on constraint study_sync_receipts_pkey do update set sequence=greatest(public.study_sync_receipts.sequence,excluded.sequence);
   return query select true,owner_id,next_row.revision,next_row.data;return;
  end if;
  select s.* into current_row from public.study_states s where s.user_id=owner_id for update;
 end if;
 if exists(select 1 from public.study_sync_receipts r where r.profile_id=owner_id and r.client_id=p_client_id and r.sequence>=p_sequence)
 then return query select true,owner_id,current_row.revision,current_row.data;return;end if;
 if current_row.revision<>p_expected_revision then
  return query select false,owner_id,current_row.revision,current_row.data;return;
 end if;
 update public.study_states s set data=p_data where s.user_id=owner_id returning s.* into next_row;
 insert into public.study_sync_receipts(profile_id,client_id,sequence) values(owner_id,p_client_id,p_sequence)
  on conflict on constraint study_sync_receipts_pkey do update set sequence=greatest(public.study_sync_receipts.sequence,excluded.sequence);
 return query select true,owner_id,next_row.revision,next_row.data;
end;
$$;
revoke all on function public.save_study_progress(uuid,bigint,jsonb,uuid,bigint) from public,anon;
grant execute on function public.save_study_progress(uuid,bigint,jsonb,uuid,bigint) to authenticated;

drop policy if exists "Username profiles read study content" on public.study_content;
create policy "Username profiles read study content" on public.study_content for select to authenticated
 using((select public.current_study_profile_id()) is not null);
drop policy if exists "Username profiles read study releases" on public.study_content_releases;
create policy "Username profiles read study releases" on public.study_content_releases for select to authenticated
 using((select public.current_study_profile_id()) is not null
 and release not in('2026-11-03-supplemental-1','2026-11-03-supplemental-2','2026-11-03-original-bank-1'));

select p.username,p.user_id as profile_id,s.revision,
 md5(coalesce(s.data::text,'')) as state_fingerprint
 from public.study_profiles p left join public.study_states s on s.user_id=p.user_id
 where p.normalized_username='elaine';
commit;
notify pgrst,'reload schema';
