-- Apply after play-schema.sql. No signing key or device data is exposed to students.
begin;

create table if not exists reviewer_play.presence (
 profile uuid primary key references public.study_profiles(user_id) on delete cascade,
 sharing boolean not null default true,
 activity text check(activity in ('online','study','play')),
 seen_at timestamptz
);

create table if not exists reviewer_play.social_limits (
 profile uuid not null references public.study_profiles(user_id) on delete cascade,
 action text not null,
 window_at timestamptz not null,
 used integer not null,
 primary key(profile,action)
);

create table if not exists reviewer_play.friend_invites (
 id uuid primary key default gen_random_uuid(),
 sender uuid not null references public.study_profiles(user_id) on delete cascade,
 recipient uuid not null references public.study_profiles(user_id) on delete cascade,
 room text not null unique references reviewer_play.rooms(code) on delete cascade,
 sent_at timestamptz not null,
 expires_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','accepted','dismissed')),
 check(sender<>recipient)
);
create index if not exists reviewer_play_invites_recipient on reviewer_play.friend_invites(recipient,expires_at) where status='pending';
create index if not exists reviewer_play_invites_sender on reviewer_play.friend_invites(sender,expires_at) where status='pending';

create table if not exists reviewer_play.push_config (
 singleton boolean primary key default true check(singleton),
 worker_token text not null default replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),
 vapid_public text,
 last_wake_at timestamptz
);
insert into reviewer_play.push_config(singleton) values(true) on conflict do nothing;

create table if not exists reviewer_play.push_subscriptions (
 id uuid primary key default gen_random_uuid(),
 profile uuid not null references public.study_profiles(user_id) on delete cascade,
 endpoint text not null unique,
 p256dh text not null,
 auth_key text not null,
 friend_reminders boolean not null,
 cup_reminders boolean not null
);
create index if not exists reviewer_play_push_profile on reviewer_play.push_subscriptions(profile);

create table if not exists reviewer_play.push_queue (
 id uuid primary key default gen_random_uuid(),
 subscription uuid not null references reviewer_play.push_subscriptions(id) on delete cascade,
 event_key text not null,
 kind text not null check(kind in ('friend','cup','test')),
 invite uuid references reviewer_play.friend_invites(id) on delete cascade,
 ready_at timestamptz not null,
 expires_at timestamptz not null,
 tries smallint not null default 0,
 lease uuid,
 done boolean not null default false,
 unique(subscription,event_key)
);
create index if not exists reviewer_play_push_ready on reviewer_play.push_queue(ready_at) where not done;

revoke all on all tables in schema reviewer_play from public,anon,authenticated;
alter table reviewer_play.presence enable row level security;
alter table reviewer_play.social_limits enable row level security;
alter table reviewer_play.friend_invites enable row level security;
alter table reviewer_play.push_config enable row level security;
alter table reviewer_play.push_subscriptions enable row level security;
alter table reviewer_play.push_queue enable row level security;

create or replace function reviewer_play.use_social_limit(actor uuid,action_key text,max_actions integer,window_length interval) returns void
language plpgsql set search_path='' as $$
declare moment timestamptz:=clock_timestamp(); next_count integer;
begin
 insert into reviewer_play.social_limits as limits(profile,action,window_at,used) values(actor,action_key,moment,1)
 on conflict(profile,action) do update set
  used=case when limits.window_at<=moment-window_length then 1 else limits.used+1 end,
  window_at=case when limits.window_at<=moment-window_length then moment else limits.window_at end
 returning used into next_count;
 if next_count>max_actions then raise exception 'Too many requests. Try again later.'; end if;
end $$;

create or replace function public.play_presence(p_activity text) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); moment timestamptz:=clock_timestamp();
begin
 if p_activity is null or p_activity not in ('online','study','play') then return false; end if;
 if not exists(select 1 from reviewer_play.friendships f where actor in (f.first_profile,f.second_profile) and f.accepted_at is not null) then return false; end if;
 insert into reviewer_play.presence as old(profile,activity,seen_at) values(actor,p_activity,moment)
 on conflict(profile) do update set activity=excluded.activity,seen_at=excluded.seen_at
 where old.sharing and (old.seen_at is null or old.seen_at<=moment-interval '5 seconds' or old.activity is distinct from p_activity);
 return found;
end $$;

create or replace function public.play_share_presence(p_sharing boolean) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer();
begin
 if p_sharing is null then raise exception 'Choose whether to show your activity.'; end if;
 insert into reviewer_play.presence(profile,sharing) values(actor,p_sharing)
 on conflict(profile) do update set sharing=excluded.sharing,activity=null,seen_at=null;
 return p_sharing;
end $$;

create or replace function public.play_friend_action(p_action text,p_username text) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); peer uuid; moment timestamptz:=clock_timestamp();
begin
 if p_action not in ('request','accept','remove') or p_action is null or p_username is null or length(trim(p_username)) not between 1 and 40 then
  raise exception 'Enter a valid username.';
 end if;
 if p_action='request' then perform reviewer_play.use_social_limit(actor,'friend-request',20,interval '1 hour'); end if;
 select user_id into peer from public.study_profiles where lower(username)=lower(trim(p_username)) and user_id<>actor;
 if peer is null then return false; end if;
 if p_action='request' then
  insert into reviewer_play.friendships(first_profile,second_profile,requested_by,requested_at)
  values(least(actor,peer),greatest(actor,peer),actor,moment) on conflict do nothing;
  return true;
 elsif p_action='accept' then
  update reviewer_play.friendships set accepted_at=coalesce(accepted_at,moment)
  where first_profile=least(actor,peer) and second_profile=greatest(actor,peer) and requested_by=peer;
  return found;
 end if;
 delete from reviewer_play.friendships where first_profile=least(actor,peer) and second_profile=greatest(actor,peer);
 if not found then return false; end if;
 update reviewer_play.friend_invites set status='dismissed' where status='pending'
  and ((sender=actor and recipient=peer) or (sender=peer and recipient=actor));
 return true;
end $$;

create or replace function public.play_social_overview() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); moment timestamptz:=clock_timestamp();
begin
 return jsonb_build_object('serverAt',extract(epoch from moment)*1000,
  'sharing',coalesce((select sharing from reviewer_play.presence where profile=actor),true),
  'friends',coalesce((select jsonb_agg(entry order by entry.label) from (
   select profile.username as label,
    case when f.accepted_at is not null then 'accepted' when f.requested_by=actor then 'outgoing' else 'incoming' end as relationship,
    case when f.accepted_at is null or activity.sharing=false then 'hidden'
     when activity.seen_at>moment-interval '85 seconds' then coalesce(activity.activity,'online') else 'offline' end as activity,
    case when f.accepted_at is not null and activity.sharing and activity.seen_at>=moment-interval '30 days'
     then extract(epoch from activity.seen_at)*1000 end as "seenAt"
   from reviewer_play.friendships f
   join public.study_profiles profile on profile.user_id=case when f.first_profile=actor then f.second_profile else f.first_profile end
   left join reviewer_play.presence activity on activity.profile=profile.user_id
   where actor in (f.first_profile,f.second_profile)
  ) entry),'[]'::jsonb),
  'invites',coalesce((select jsonb_agg(entry order by entry."expiresAt") from (
   select i.id,p.username as label,extract(epoch from i.expires_at)*1000 as "expiresAt"
   from reviewer_play.friend_invites i join public.study_profiles p on p.user_id=i.sender
   join reviewer_play.rooms r on r.code=i.room
   where i.recipient=actor and i.status='pending' and i.expires_at>moment and r.starts_at is null and r.finished_at is null
    and reviewer_play.are_friends(i.sender,actor)
  ) entry),'[]'::jsonb)
 );
end $$;

create or replace function public.play_friend_invite(p_username text) returns text
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); peer uuid; label_text text; code_text text; invite_id uuid;
 moment timestamptz; expires timestamptz; selected text[];
begin
 if p_username is null or length(trim(p_username)) not between 1 and 40 then raise exception 'Choose a friend.'; end if;
 select user_id into peer from public.study_profiles where lower(username)=lower(trim(p_username)) and user_id<>actor;
 if peer is null or not reviewer_play.are_friends(actor,peer) then raise exception 'You can invite an accepted friend.'; end if;
 perform pg_advisory_xact_lock(hashtext('reviewer-play-lobby'));
 moment:=clock_timestamp();
 select i.room into code_text from reviewer_play.friend_invites i join reviewer_play.rooms r on r.code=i.room
 where i.sender=actor and i.recipient=peer and i.status='pending' and i.expires_at>moment
  and r.starts_at is null and r.finished_at is null order by i.sent_at desc limit 1;
 if code_text is not null then return code_text; end if;
 if exists(select 1 from reviewer_play.friend_invites i join reviewer_play.rooms r on r.code=i.room
  where i.sender=actor and i.status='pending' and i.expires_at>moment and r.starts_at is null and r.finished_at is null) then
  raise exception 'Close your other friend lobby before sending a new invite.';
 end if;
 perform reviewer_play.use_social_limit(actor,'live-invite',20,interval '1 hour');
 selected:=reviewer_play.draw('all','',10);
 if cardinality(selected)<>10 then raise exception 'The invite needs ten available questions. Try again shortly.'; end if;
 select username into strict label_text from public.study_profiles where user_id=actor;
 expires:=moment+interval '5 minutes';
 insert into reviewer_play.rooms(mode,host,subject,question_ids,expires_at)
 values('duel',actor,'all',selected,expires) returning code into code_text;
 insert into reviewer_play.players(room,profile,label) values(code_text,actor,label_text);
 insert into reviewer_play.friend_invites(sender,recipient,room,sent_at,expires_at) values(actor,peer,code_text,moment,expires) returning id into invite_id;
 insert into reviewer_play.push_queue(subscription,event_key,kind,invite,ready_at,expires_at)
 select s.id,'friend:'||invite_id,'friend',invite_id,moment,expires from reviewer_play.push_subscriptions s
 where s.profile=peer and s.friend_reminders on conflict do nothing;
 return code_text;
end $$;

create or replace function public.play_friend_reply(p_invite uuid,p_accept boolean) returns text
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); invitation reviewer_play.friend_invites%rowtype; code_text text;
begin
 select * into invitation from reviewer_play.friend_invites where id=p_invite and recipient=actor for update;
 if not found or invitation.status='dismissed' or invitation.expires_at<=clock_timestamp()
  or not reviewer_play.are_friends(actor,invitation.sender) then raise exception 'This invite is no longer available.'; end if;
 if p_accept is false then
  update reviewer_play.friend_invites set status='dismissed' where id=p_invite and status='pending';
  return null;
 elsif p_accept is null then raise exception 'Choose whether to join.';
 end if;
 code_text:=public.play_join(invitation.room);
 update reviewer_play.friend_invites set status='accepted' where id=p_invite;
 return code_text;
end $$;

create or replace function public.play_push_settings(p_endpoint text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); device reviewer_play.push_subscriptions%rowtype;
begin
 select * into device from reviewer_play.push_subscriptions where endpoint=p_endpoint and profile=actor;
 return jsonb_build_object('publicKey',(select vapid_public from reviewer_play.push_config where singleton),
  'friend',coalesce(device.friend_reminders,false),'cup',coalesce(device.cup_reminders,false));
end $$;

create or replace function public.play_push_save(p_endpoint text,p_p256dh text,p_auth text,p_friend boolean,p_cup boolean) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); old reviewer_play.push_subscriptions%rowtype;
begin
 if p_endpoint is null or length(p_endpoint)>2048 or p_endpoint!~'^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)/[^[:space:]]+$'
  or p_p256dh is null or p_p256dh!~'^[A-Za-z0-9_-]{87}$' or p_auth is null or p_auth!~'^[A-Za-z0-9_-]{22}$'
  or p_friend is null or p_cup is null then raise exception 'This device could not register for web push.'; end if;
 if not p_friend and not p_cup then
  delete from reviewer_play.push_subscriptions where endpoint=p_endpoint and profile=actor;
  return true;
 end if;
 perform pg_advisory_xact_lock(hashtext(p_endpoint));
 select * into old from reviewer_play.push_subscriptions where endpoint=p_endpoint for update;
 if old.id is not null then
  if old.profile=actor and old.p256dh=p_p256dh and old.auth_key=p_auth then
   update reviewer_play.push_subscriptions set friend_reminders=p_friend,cup_reminders=p_cup where id=old.id;
   return true;
  end if;
  if old.profile<>actor and (old.p256dh<>p_p256dh or old.auth_key<>p_auth) then
   raise exception 'Refresh your browser subscription and try again.';
  end if;
  delete from reviewer_play.push_subscriptions where id=old.id;
 end if;
 insert into reviewer_play.push_subscriptions(profile,endpoint,p256dh,auth_key,friend_reminders,cup_reminders)
 values(actor,p_endpoint,p_p256dh,p_auth,p_friend,p_cup);
 return true;
end $$;

create or replace function public.play_push_test(p_endpoint text) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); moment timestamptz:=clock_timestamp(); target uuid;
begin
 select id into target from reviewer_play.push_subscriptions where profile=actor and endpoint=p_endpoint;
 if target is null then return false; end if;
 perform reviewer_play.use_social_limit(actor,'push-test',3,interval '10 minutes');
 insert into reviewer_play.push_queue(subscription,event_key,kind,ready_at,expires_at)
 values(target,'test:'||gen_random_uuid(),'test',moment,moment+interval '2 minutes');
 return true;
end $$;

create or replace function reviewer_play.queue_cup_reminders(moment timestamptz) returns void
language plpgsql set search_path='' as $$
declare cup_start timestamptz:=reviewer_play.cup_start(moment);
begin
 if moment<cup_start-interval '15 minutes' or moment>=cup_start then return; end if;
 insert into reviewer_play.push_queue(subscription,event_key,kind,ready_at,expires_at)
 select s.id,'cup:'||(cup_start at time zone 'Asia/Manila')::date,'cup',moment,cup_start
 from reviewer_play.push_subscriptions s where s.cup_reminders on conflict do nothing;
end $$;

create or replace function reviewer_play.verify_push_worker(p_token text) returns void
language plpgsql set search_path='' as $$
begin
 if p_token is null or length(p_token)<>64 or not exists(select 1 from reviewer_play.push_config where singleton and worker_token=p_token) then
  raise exception 'Push worker access denied.' using errcode='42501';
 end if;
end $$;

create or replace function public.play_push_take(p_token text,p_public_key text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare moment timestamptz:=clock_timestamp(); jobs jsonb;
begin
 perform reviewer_play.verify_push_worker(p_token);
 if p_public_key is null or p_public_key!~'^[A-Za-z0-9_-]{87}$' then raise exception 'Invalid worker key.'; end if;
 update reviewer_play.push_config set vapid_public=p_public_key where singleton and vapid_public is null;
 if not exists(select 1 from reviewer_play.push_config where singleton and vapid_public=p_public_key) then raise exception 'The worker key does not match the registered key.'; end if;
 with available as (
  select q.id from reviewer_play.push_queue q join reviewer_play.push_subscriptions s on s.id=q.subscription
  left join reviewer_play.friend_invites i on i.id=q.invite
  where not q.done and q.tries<4 and q.ready_at<=moment and q.expires_at>moment
   and (q.kind='test' or q.kind='cup' and s.cup_reminders or q.kind='friend' and s.friend_reminders
    and i.status='pending' and i.expires_at>moment and s.profile=i.recipient and reviewer_play.are_friends(i.sender,i.recipient)
    and exists(select 1 from reviewer_play.rooms r where r.code=i.room and r.finished_at is null and r.starts_at is null))
  order by q.ready_at,q.id limit 24 for update of q skip locked
 ), claimed as (
  update reviewer_play.push_queue q set tries=q.tries+1,ready_at=moment+interval '1 minute',lease=gen_random_uuid()
  from available where q.id=available.id returning q.*
 ) select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'lease',q.lease,'kind',q.kind,'event',q.event_key,'invite',q.invite,
   'ttl',greatest(1,extract(epoch from (q.expires_at-moment))::int),
   'endpoint',s.endpoint,'p256dh',s.p256dh,'auth',s.auth_key)),'[]'::jsonb)
 into jobs from claimed q join reviewer_play.push_subscriptions s on s.id=q.subscription;
 return jobs;
end $$;

create or replace function public.play_push_finish(p_token text,p_results jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare result record;
begin
 perform reviewer_play.verify_push_worker(p_token);
 if jsonb_typeof(p_results) is distinct from 'array' or jsonb_array_length(p_results)>24 then raise exception 'Invalid push receipt.'; end if;
 for result in select * from jsonb_to_recordset(p_results) as r(id uuid,lease uuid,status text) loop
  if result.status='gone' then
   delete from reviewer_play.push_subscriptions where id in (select subscription from reviewer_play.push_queue
    where id=result.id and lease=result.lease and not done);
  elsif result.status in ('sent','failed','retry') then
   update reviewer_play.push_queue set done=result.status<>'retry',lease=null where id=result.id and lease=result.lease and not done;
  end if;
 end loop;
end $$;

revoke execute on all functions in schema reviewer_play from public,anon,authenticated;
revoke all on function public.play_presence(text),public.play_share_presence(boolean),public.play_friend_action(text,text),
 public.play_social_overview(),public.play_friend_invite(text),public.play_friend_reply(uuid,boolean),
 public.play_push_settings(text),public.play_push_save(text,text,text,boolean,boolean),public.play_push_test(text) from public,anon;
grant execute on function public.play_presence(text),public.play_share_presence(boolean),public.play_friend_action(text,text),
 public.play_social_overview(),public.play_friend_invite(text),public.play_friend_reply(uuid,boolean),
 public.play_push_settings(text),public.play_push_save(text,text,text,boolean,boolean),public.play_push_test(text) to authenticated;

-- These two RPCs additionally require the 244-bit token held by the database's scheduler.
revoke all on function public.play_push_take(text,text),public.play_push_finish(text,jsonb) from public,authenticated;
grant execute on function public.play_push_take(text,text),public.play_push_finish(text,jsonb) to anon;
commit;
