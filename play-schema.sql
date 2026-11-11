begin;
create schema if not exists reviewer_play;
revoke all on schema reviewer_play from public, anon, authenticated;

create table if not exists reviewer_play.question_pool (
 id text primary key,
 subject text not null check(subject in ('CROSS','NP1','NP2','NP3','NP4','NP5')),
 topic text not null,
 family text not null,
 answer smallint not null check(answer between 0 and 3)
);
create table if not exists reviewer_play.rooms (
 code text primary key default upper(left(replace(gen_random_uuid()::text,'-',''),10)),
 mode text not null check(mode in ('duel','ranked','challenge','quiz','code','cup')),
 host uuid not null references public.study_profiles(user_id) on delete cascade,
 subject text not null,
 topic text not null default '',
 discoverable boolean not null default false,
 question_ids text[] not null default '{}',
 created_at timestamptz not null default clock_timestamp(),
 expires_at timestamptz not null,
 starts_at timestamptz,
 finished_at timestamptz,
 cup_day date unique
);
create table if not exists reviewer_play.players (
 room text not null references reviewer_play.rooms(code) on delete cascade,
 profile uuid not null references public.study_profiles(user_id) on delete cascade,
 label text not null,
 joined_at timestamptz not null default clock_timestamp(),
 starts_at timestamptz,
 left_at timestamptz,
 primary key(room,profile)
);
alter table reviewer_play.rooms add column if not exists ranked_last_seen_at timestamptz;
alter table reviewer_play.rooms add column if not exists duel_last_seen_at timestamptz;
alter table reviewer_play.rooms add column if not exists ranked_opponent_points smallint[];
alter table reviewer_play.rooms add column if not exists replay_label text;
alter table reviewer_play.players add column if not exists ranked_result jsonb;
create index if not exists reviewer_play_players_history on reviewer_play.players(profile,joined_at desc);
create index if not exists reviewer_play_ranked_queue on reviewer_play.rooms(created_at)
 where mode='ranked' and starts_at is null and finished_at is null;
create index if not exists reviewer_play_duel_queue on reviewer_play.rooms(subject,topic,created_at)
 where mode='duel' and discoverable and starts_at is null and finished_at is null;
create table if not exists reviewer_play.answers (
 room text not null,
 profile uuid not null,
 item smallint not null check(item between 1 and 15),
 choice smallint not null check(choice between 0 and 3),
 correct boolean not null,
 points integer not null check(points>=0),
 primary key(room,profile,item),
 foreign key(room,profile) references reviewer_play.players(room,profile) on delete cascade
);
create table if not exists reviewer_play.ranks (
 season text not null,
 profile uuid not null references public.study_profiles(user_id) on delete cascade,
 label text not null,
 tier smallint not null default 0 check(tier between 0 and 4),
 stars integer not null default 0 check(stars>=0),
 matches integer not null default 0,
 wins integer not null default 0,
 losses integer not null default 0,
 primary key(season,profile)
);
create table if not exists reviewer_play.messages (
 id bigint generated always as identity primary key,
 room text not null,
 profile uuid not null,
 body text not null check(char_length(body) between 1 and 160),
 posted_at timestamptz not null default clock_timestamp(),
 foreign key(room,profile) references reviewer_play.players(room,profile) on delete cascade
);
create table if not exists reviewer_play.replay_sharing (
 profile uuid primary key references public.study_profiles(user_id) on delete cascade,
 enabled boolean not null
);
revoke all on all tables in schema reviewer_play from public, anon, authenticated;
alter table reviewer_play.question_pool enable row level security;
alter table reviewer_play.rooms enable row level security;
alter table reviewer_play.players enable row level security;
alter table reviewer_play.answers enable row level security;
alter table reviewer_play.ranks enable row level security;
alter table reviewer_play.messages enable row level security;
alter table reviewer_play.replay_sharing enable row level security;

create or replace function reviewer_play.viewer() returns uuid
language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=public.current_study_profile_id();
begin
 if actor is null then raise exception 'Sign in to open Play.' using errcode='42501'; end if;
 return actor;
end $$;

create or replace function reviewer_play.season(moment timestamptz) returns text
language sql stable set search_path='' as $$
 select to_char(moment at time zone 'Asia/Manila','YYYY-MM');
$$;

create or replace function reviewer_play.limit_for(mode text) returns integer
language sql immutable set search_path='' as $$
 select case when mode='cup' then 40 when mode='quiz' then 10 when mode='code' then 6 else 2 end;
$$;

create or replace function reviewer_play.cup_start(moment timestamptz) returns timestamptz
language sql stable set search_path='' as $$
 select (((moment at time zone 'Asia/Manila')::date+time '21:00') at time zone 'Asia/Manila');
$$;

create or replace function reviewer_play.can_join(game reviewer_play.rooms, moment timestamptz) returns boolean
language sql stable set search_path='' as $$
 select game.finished_at is null and game.expires_at>moment and game.mode<>'ranked'
  and (game.starts_at is null or (game.mode='cup' and moment<game.starts_at));
$$;

create or replace function reviewer_play.room_due(game reviewer_play.rooms, moment timestamptz) returns boolean
language plpgsql stable set search_path='' as $$
begin
 if game.finished_at is not null then return false; end if;
 if game.expires_at<=moment then return true; end if;
 if game.mode='challenge' then
  return (select count(*) from reviewer_play.players where room=game.code)>=2
   and not exists(select 1 from reviewer_play.players p where p.room=game.code
    and (p.starts_at is null or (p.left_at is null and p.starts_at+cardinality(game.question_ids)*interval '18 seconds'>moment)));
 end if;
 if game.starts_at is null then return false; end if;
 return game.starts_at+cardinality(game.question_ids)*interval '18 seconds'<=moment
  or (game.mode in ('duel','ranked') and exists(select 1 from reviewer_play.players p
   where p.room=game.code and p.left_at>=game.starts_at-interval '4 seconds'));
end $$;

create or replace function reviewer_play.team_stability(room_code text, revealed integer) returns integer
language plpgsql stable set search_path='' as $$
declare recovered boolean; stability int:=100;
begin
 for recovered in
  select exists(select 1 from reviewer_play.answers a where a.room=room_code and a.item=rounds.item and a.correct)
  from generate_series(1,revealed) as rounds(item) order by rounds.item
 loop
  stability:=greatest(0,least(100,stability+case when recovered then 2 else -12 end));
 end loop;
 return stability;
end $$;

create or replace function reviewer_play.draw(subject_key text, topic_key text, quantity int) returns text[]
language sql volatile set search_path='' as $$
 with per_case as (
  select distinct on (family) id, topic=topic_key as preferred
  from reviewer_play.question_pool
  where subject_key='all' or subject=subject_key
  order by family,(topic=topic_key) desc,random()
 )
 select coalesce(array_agg(id order by position),'{}') from (
  select id,row_number() over(order by preferred desc,random()) as position from per_case limit quantity
 ) picks;
$$;

create or replace function reviewer_play.ranked_tier(profile_id uuid, season_key text) returns integer
language sql stable set search_path='' as $$
 select coalesce((
  select case when r.season=season_key then r.tier else greatest(0,r.tier-2) end
  from reviewer_play.ranks r
  where r.profile=profile_id and r.season<=season_key
  order by r.season desc limit 1
 ),0);
$$;

create or replace function reviewer_play.draw_ranked(first_profile uuid, second_profile uuid) returns text[]
language sql volatile set search_path='' as $$
 with recent_rooms as (
  select r.question_ids
  from reviewer_play.players p join reviewer_play.rooms r on r.code=p.room
  where p.profile in (first_profile,second_profile) and r.mode='ranked' and r.starts_at is not null
  order by p.joined_at desc limit 24
 ), recent_cases as (
  select distinct q.family
  from recent_rooms r cross join lateral unnest(r.question_ids) as item(id)
  join reviewer_play.question_pool q on q.id=item.id
 ), distinct_cases as (
  select distinct on (q.family) q.id,q.family
  from reviewer_play.question_pool q
  order by q.family,random()
 ), picks as (
  select q.id,row_number() over(order by recent.family is not null,random()) as position
  from distinct_cases q left join recent_cases recent using(family)
  limit 10
 )
 select coalesce(array_agg(id order by position),'{}') from picks;
$$;

create or replace function reviewer_play.advance_ranked_queue(room_code text, actor uuid, moment timestamptz)
returns void language plpgsql set search_path='' as $$
declare game reviewer_play.rooms%rowtype; selected text[]; opponent_points smallint[]; tier int;
begin
 select * into game from reviewer_play.rooms where code=room_code for update;
 if not found or game.mode<>'ranked' or game.host<>actor or game.finished_at is not null
  or game.starts_at is not null or game.expires_at<=moment then return; end if;
 if moment<game.created_at+interval '8 seconds' then
  if game.ranked_last_seen_at is null or game.ranked_last_seen_at<=moment-interval '3 seconds' then
   update reviewer_play.rooms set ranked_last_seen_at=moment where code=room_code;
  end if;
  return;
 end if;
 selected:=reviewer_play.draw_ranked(actor,null);
 if cardinality(selected)<>10 then raise exception 'Ranked needs ten available questions. Try again shortly.'; end if;
 tier:=reviewer_play.ranked_tier(actor,reviewer_play.season(moment+interval '4 seconds'));
 -- Generate the same speed-based score a player would earn for a correct answer.
 -- Store the result once so refreshes and additional devices see the same opponent.
 select array_agg((case when random()<0.45+0.09*tier
  then 500+floor((15-(4.5-0.6*tier+random()*8))*30) else 0 end)::smallint order by item)
 into opponent_points from generate_series(1,10) as slots(item);
 moment:=clock_timestamp();
 update reviewer_play.rooms set
  question_ids=selected,ranked_opponent_points=opponent_points,starts_at=moment+interval '4 seconds',
  expires_at=moment+interval '10 minutes'
 where code=room_code;
end $$;

create or replace function reviewer_play.advance_duel_queue(room_code text, actor uuid, moment timestamptz)
returns void language plpgsql security definer set search_path='' as $$
declare game reviewer_play.rooms%rowtype; replay record; opponent_points smallint[];
begin
 select * into game from reviewer_play.rooms where code=room_code for update;
 if not found or game.mode<>'duel' or not game.discoverable or game.host<>actor
  or game.starts_at is not null or game.finished_at is not null or game.expires_at<=moment then return; end if;
 if game.created_at+interval '8 seconds'>moment then
  update reviewer_play.rooms set duel_last_seen_at=moment where code=room_code;
  return;
 end if;

 select round.code,round.question_ids,player.profile,player.label into replay
 from reviewer_play.rooms round
 join reviewer_play.players player on player.room=round.code
 join reviewer_play.replay_sharing sharing on sharing.profile=player.profile and sharing.enabled
 where round.mode='duel' and round.subject=game.subject and round.topic=game.topic
  and player.profile<>actor and player.left_at is null and cardinality(round.question_ids)=10
  and round.finished_at is not null and round.finished_at>=round.starts_at+interval '180 seconds'
  and not exists(select 1 from unnest(round.question_ids) id where not exists(select 1 from reviewer_play.question_pool q where q.id=id))
  and exists(select 1 from reviewer_play.answers a where a.room=round.code and a.profile=player.profile)
 order by round.finished_at desc,round.code,player.profile limit 1;

 if found then
  select array_agg(coalesce(a.points,0)::smallint order by n.item) into opponent_points
  from generate_series(1,10) as n(item)
  left join reviewer_play.answers a on a.room=replay.code and a.profile=replay.profile and a.item=n.item;
 else
  select array_agg((case when random()<0.55 then 500+floor(random()*400) else 0 end)::smallint order by item)
  into opponent_points from generate_series(1,10) item;
 end if;
 update reviewer_play.rooms set question_ids=coalesce(replay.question_ids,game.question_ids),
  ranked_opponent_points=opponent_points,replay_label=replay.label,
  starts_at=moment+interval '4 seconds',expires_at=moment+interval '10 minutes' where code=room_code;
end $$;

create or replace function reviewer_play.settle(room_code text, moment timestamptz) returns void
language plpgsql security definer set search_path='' as $$
declare game reviewer_play.rooms%rowtype; player record; rank reviewer_play.ranks%rowtype;
 other_score int; won boolean; lost boolean; gain int; tier_after int; stars_after int; current_season text;
 opponent_left boolean; rank_before int; star_change int; has_answers boolean; someone_left boolean;
begin
 select * into game from reviewer_play.rooms where code=room_code for update;
 if not found or not reviewer_play.room_due(game,moment) then return; end if;
 update reviewer_play.rooms set finished_at=least(moment,game.expires_at,
  game.starts_at+cardinality(game.question_ids)*interval '18 seconds')
 where code=room_code;
 if game.mode<>'ranked' or game.starts_at is null then return; end if;
 current_season:=reviewer_play.season(game.starts_at);
 has_answers:=exists(select 1 from reviewer_play.answers where room=room_code);
 someone_left:=exists(select 1 from reviewer_play.players where room=room_code and left_at is not null);
 if not has_answers and not someone_left then
  update reviewer_play.players set ranked_result=jsonb_build_object('outcome','void','season',current_season)
  where room=room_code;
  return;
 end if;
 for player in
  select p.profile,p.label,p.left_at,coalesce(sum(a.points),0)::int as points,count(*) filter(where a.correct)::int as right
  from reviewer_play.players p left join reviewer_play.answers a using(room,profile)
  where p.room=room_code group by p.profile,p.label,p.left_at order by p.profile
 loop
  opponent_left:=false;
  if game.ranked_opponent_points is not null then
   select sum(points)::int into other_score from unnest(game.ranked_opponent_points) as opponent(points);
  else
   select coalesce(sum(a.points),0)::int into other_score
   from reviewer_play.answers a where a.room=room_code and a.profile<>player.profile;
   opponent_left:=exists(select 1 from reviewer_play.players p
    where p.room=room_code and p.profile<>player.profile and p.left_at is not null);
  end if;
  won:=player.left_at is null and (opponent_left or player.points>other_score);
  lost:=player.left_at is not null or (not won and player.points<other_score);
  insert into reviewer_play.ranks(season,profile,label,tier)
   values(current_season,player.profile,player.label,reviewer_play.ranked_tier(player.profile,current_season))
   on conflict(season,profile) do nothing;
  select * into rank from reviewer_play.ranks where season=current_season and profile=player.profile for update;
  gain:=case when won then 1 when lost and player.right<7 then -1 else 0 end;
  rank_before:=rank.tier;
  tier_after:=rank_before;
  if rank.matches<3 then
   gain:=0;
   if rank.matches=2 then tier_after:=greatest(tier_after,least(2,rank.wins+won::int)); end if;
  end if;
  stars_after:=greatest(0,rank.stars+gain);
  star_change:=stars_after-rank.stars;
  if rank.matches>=3 and stars_after>=5 and rank.tier<4 then
   tier_after:=rank.tier+1;
   stars_after:=stars_after-5;
  end if;
  update reviewer_play.ranks set label=player.label,tier=tier_after,stars=stars_after,
   matches=rank.matches+1,wins=rank.wins+won::int,losses=rank.losses+lost::int
  where season=current_season and profile=player.profile;
  update reviewer_play.players set ranked_result=jsonb_build_object(
   'outcome',case when won then 'win' when lost then 'loss' else 'draw' end,
   'season',current_season,'tier',tier_after,'stars',stars_after,'matches',rank.matches+1,
   'starChange',star_change,'promoted',rank.matches>=3 and tier_after>rank_before,
   'protected',rank.matches>=3 and lost and player.right>=7,
   'forfeit',player.left_at is not null or opponent_left
  ) where room=room_code and profile=player.profile;
 end loop;
end $$;

create or replace function reviewer_play.finish_due_ranked(actor uuid, moment timestamptz)
returns void language plpgsql set search_path='' as $$
declare room_code text;
begin
 for room_code in
  select r.code from reviewer_play.players p join reviewer_play.rooms r on r.code=p.room
  where p.profile=actor and r.mode='ranked' and r.finished_at is null
   and r.starts_at+cardinality(r.question_ids)*interval '18 seconds'<=moment
  order by r.starts_at,r.code
 loop
  perform reviewer_play.settle(room_code,moment);
 end loop;
end $$;

create or replace function public.play_open(p_mode text,p_subject text,p_topic text,p_public boolean) returns text
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); label_text text; code_text text; selected text[];
 moment timestamptz; today date; cup_start timestamptz;
 actor_tier int; opponent uuid; season_key text;
begin
 if p_mode not in ('duel','ranked','challenge','quiz','code','cup') or p_mode is null then raise exception 'Choose a game mode.'; end if;
 if p_subject not in ('all','CROSS','NP1','NP2','NP3','NP4','NP5') or p_subject is null or length(coalesce(p_topic,''))>100 then raise exception 'Choose a valid subject.'; end if;
 select username into strict label_text from public.study_profiles where user_id=actor;
 perform pg_advisory_xact_lock(hashtext('reviewer-play-lobby'));
 moment:=clock_timestamp();
 if p_mode='ranked' then
  perform reviewer_play.finish_due_ranked(actor,moment);
  select r.code into code_text
  from reviewer_play.players p join reviewer_play.rooms r on r.code=p.room
  where p.profile=actor and p.left_at is null and r.mode='ranked'
   and r.finished_at is null and r.expires_at>moment
  order by r.starts_at is not null desc,p.joined_at desc limit 1;
  if code_text is not null then return code_text; end if;

  season_key:=reviewer_play.season(moment+interval '4 seconds');
  actor_tier:=reviewer_play.ranked_tier(actor,season_key);
  select r.code,r.host into code_text,opponent
  from reviewer_play.rooms r
  where r.mode='ranked' and r.host<>actor and r.discoverable
   and r.starts_at is null and r.finished_at is null and r.expires_at>moment
   and r.ranked_last_seen_at>moment-interval '12 seconds'
   and abs(actor_tier-reviewer_play.ranked_tier(r.host,season_key))<=1
  order by r.created_at limit 1 for update of r;
  if code_text is null then
   insert into reviewer_play.rooms(mode,host,subject,discoverable,expires_at,ranked_last_seen_at)
   values('ranked',actor,'all',true,moment+interval '2 minutes',moment) returning code into code_text;
  else
   selected:=reviewer_play.draw_ranked(actor,opponent);
   if cardinality(selected)<>10 then raise exception 'Ranked needs ten available questions. Try again shortly.'; end if;
   moment:=clock_timestamp();
   update reviewer_play.rooms set question_ids=selected,starts_at=moment+interval '4 seconds',expires_at=moment+interval '10 minutes'
   where code=code_text;
  end if;
  insert into reviewer_play.players(room,profile,label) values(code_text,actor,label_text);
  return code_text;
 elsif p_mode='cup' then
  cup_start:=reviewer_play.cup_start(moment);
  today:=(cup_start at time zone 'Asia/Manila')::date;
  select code into code_text from reviewer_play.rooms where cup_day=today;
  if code_text is not null and exists(
   select 1 from reviewer_play.players where room=code_text and profile=actor and left_at is null
  ) then return code_text; end if;
  if moment<cup_start-interval '15 minutes' or moment>=cup_start then
   raise exception 'The nightly lobby is open from 8:45 to 9:00 PM Philippine time.';
  end if;
  if code_text is not null then
   return public.play_join(code_text);
  end if;
  p_subject:='all'; p_topic:=''; p_public:=false;
 elsif p_mode='duel' then
  select r.code into code_text
  from reviewer_play.players p join reviewer_play.rooms r on r.code=p.room
  where p.profile=actor and p.left_at is null and r.mode='duel'
   and r.finished_at is null and r.expires_at>moment
   and (r.starts_at+cardinality(r.question_ids)*interval '18 seconds'>moment
    or (r.starts_at is null and r.subject=p_subject and r.topic=coalesce(p_topic,'')
     and r.discoverable=coalesce(p_public,false)))
  order by r.starts_at is not null desc,p.joined_at desc limit 1;
  if code_text is not null then return code_text; end if;
  if p_public then
   select r.code into code_text from reviewer_play.rooms r
   where r.host<>actor and r.mode=p_mode and r.discoverable and r.starts_at is null and r.finished_at is null
    and r.expires_at>moment and r.subject=p_subject and r.topic=coalesce(p_topic,'')
    and r.duel_last_seen_at>moment-interval '12 seconds'
   order by r.created_at limit 1 for update of r;
   if code_text is not null then return public.play_join(code_text); end if;
  end if;
 else
  select r.code into code_text
  from reviewer_play.rooms r join reviewer_play.players p on p.room=r.code and p.profile=r.host
  where r.host=actor and r.mode=p_mode and r.subject=p_subject and r.topic=coalesce(p_topic,'')
   and r.discoverable=coalesce(p_public,false) and r.starts_at is null and r.finished_at is null
   and r.expires_at>moment and p.starts_at is null and p.left_at is null
  order by r.created_at desc limit 1;
  if code_text is not null then return code_text; end if;
 end if;
 if p_mode<>'cup' and (select count(*) from reviewer_play.rooms where host=actor and starts_at is null and finished_at is null and expires_at>moment)>=5
 then raise exception 'Close an unused lobby before opening another.'; end if;
 selected:=reviewer_play.draw(p_subject,coalesce(p_topic,''),case when p_mode='cup' then 15 else 10 end);
 if cardinality(selected)<(case when p_mode='cup' then 15 else 10 end) then raise exception 'There are not enough game questions for that selection.'; end if;
 insert into reviewer_play.rooms(mode,host,subject,topic,discoverable,question_ids,expires_at,starts_at,cup_day,duel_last_seen_at)
 values(p_mode,actor,p_subject,coalesce(p_topic,''),coalesce(p_public,false),selected,
  case when p_mode='cup' then cup_start+interval '10 minutes'
   when p_mode='duel' and p_public then moment+interval '2 minutes' else moment+interval '1 day' end,
  cup_start,today,case when p_mode='duel' and p_public then moment end)
 returning code into code_text;
 insert into reviewer_play.players(room,profile,label) values(code_text,actor,label_text);
 return code_text;
end $$;

create or replace function public.play_join(p_code text) returns text
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); game reviewer_play.rooms%rowtype; member reviewer_play.players%rowtype;
 label_text text; moment timestamptz;
begin
 select * into game from reviewer_play.rooms where code=upper(trim(p_code)) for update;
 if not found then raise exception 'That room code was not found.'; end if;
 moment:=clock_timestamp();
 select * into member from reviewer_play.players where room=game.code and profile=actor;
 if member.profile is not null and (member.left_at is null or member.starts_at is not null
  or not reviewer_play.can_join(game,moment)) then return game.code; end if;
 if not reviewer_play.can_join(game,moment) then raise exception 'This room is closed to new players.'; end if;
 if (select count(*) from reviewer_play.players where room=game.code and profile<>actor
  and (left_at is null or game.mode='challenge'))>=reviewer_play.limit_for(game.mode)
 then raise exception 'This room is full.'; end if;
 select username into strict label_text from public.study_profiles where user_id=actor;
 insert into reviewer_play.players(room,profile,label) values(game.code,actor,label_text)
 on conflict(room,profile) do update set left_at=null,label=excluded.label,joined_at=moment;
 if game.mode='duel' and game.discoverable then
  update reviewer_play.rooms set starts_at=moment+interval '4 seconds',expires_at=moment+interval '10 minutes'
  where code=game.code;
 end if;
 return game.code;
end $$;

create or replace function public.play_room_action(p_code text,p_action text) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); game reviewer_play.rooms%rowtype; member reviewer_play.players%rowtype;
 moment timestamptz:=clock_timestamp();
begin
 select * into game from reviewer_play.rooms where code=upper(trim(p_code)) for update;
 select * into member from reviewer_play.players where room=game.code and profile=actor;
 if member.profile is null then raise exception 'Join the room first.' using errcode='42501'; end if;
 moment:=clock_timestamp();
 if p_action='cancel' then
  if game.mode not in ('ranked','duel') or actor<>game.host or game.starts_at is not null then return false; end if;
  if game.finished_at is null then
   update reviewer_play.players set left_at=moment where room=game.code and profile=actor;
   update reviewer_play.rooms set finished_at=moment where code=game.code;
  end if;
  return true;
 end if;
 if game.finished_at is not null or member.left_at is not null then return p_action='leave'; end if;
 if reviewer_play.room_due(game,moment) then
  perform reviewer_play.settle(game.code,moment);
  return p_action='leave';
 end if;
 if p_action='leave' then
  if game.mode='challenge' and member.starts_at+cardinality(game.question_ids)*interval '18 seconds'<=moment then
   return true;
  end if;
  update reviewer_play.players set left_at=moment where room=game.code and profile=actor;
  if actor=game.host and game.starts_at is null and
   (game.mode<>'challenge' or not exists(select 1 from reviewer_play.players where room=game.code and profile<>actor)) then
   update reviewer_play.rooms set finished_at=moment where code=game.code;
  end if;
  perform reviewer_play.settle(game.code,moment);
  return true;
 end if;
 if p_action<>'start' or p_action is null then return false; end if;
 if game.mode='challenge' then
  if member.starts_at is null then
   update reviewer_play.players set starts_at=moment+interval '4 seconds' where room=game.code and profile=actor;
   update reviewer_play.rooms set expires_at=greatest(expires_at,moment+(cardinality(game.question_ids)*18+7)*interval '1 second')
   where code=game.code;
  end if;
  return true;
 end if;
 if game.mode in ('quiz','code','duel') and actor=game.host then
  if game.starts_at is not null then return true; end if;
  if (select count(*) from reviewer_play.players where room=game.code and left_at is null)<2 then return false; end if;
  update reviewer_play.rooms set starts_at=moment+interval '4 seconds',expires_at=moment+interval '10 minutes' where code=game.code;
  return true;
 end if;
 return false;
end $$;

create or replace function public.play_answer(p_code text,p_item integer,p_choice integer) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); game reviewer_play.rooms%rowtype; member reviewer_play.players%rowtype;
 begin_at timestamptz; seconds numeric; moment timestamptz:=clock_timestamp(); key_index int; inserted int;
begin
 select * into game from reviewer_play.rooms where code=upper(trim(p_code)) for update;
 select * into member from reviewer_play.players where room=game.code and profile=actor;
 if member.profile is null then raise exception 'Join the room first.' using errcode='42501'; end if;
 if game.finished_at is not null or member.left_at is not null or p_choice is null or p_choice not between 0 and 3
  or p_item is null or p_item not between 1 and cardinality(game.question_ids) then return false; end if;
 begin_at:=case when game.mode='challenge' then member.starts_at else game.starts_at end;
 if begin_at is null then return false; end if;
 seconds:=extract(epoch from (moment-begin_at))-(p_item-1)*18;
 if seconds<0 or seconds>=15 or moment>=game.expires_at then return false; end if;
 select answer into strict key_index from reviewer_play.question_pool where id=game.question_ids[p_item];
 insert into reviewer_play.answers(room,profile,item,choice,correct,points)
 values(game.code,actor,p_item,p_choice,p_choice=key_index,case when p_choice=key_index then 500+floor((15-seconds)*30)::int else 0 end)
 on conflict do nothing;
 get diagnostics inserted=row_count;
 return inserted=1;
end $$;

create or replace function public.play_room(p_code text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); game reviewer_play.rooms%rowtype; member reviewer_play.players%rowtype;
 moment timestamptz:=clock_timestamp(); begin_at timestamptz; elapsed numeric; current_item int:=0;
 phase text:='lobby'; key_index int; my_answer int; closes_at timestamptz; score_limit int; stability int:=100;
 simulated_limit int; simulated_points int; simulated_right int;
begin
 select * into game from reviewer_play.rooms where code=upper(trim(p_code));
 if not found then raise exception 'That room code was not found.'; end if;
 select * into member from reviewer_play.players where room=game.code and profile=actor;
 if member.profile is null then raise exception 'Join the room first.' using errcode='42501'; end if;
 if game.mode='ranked' and game.finished_at is null and member.left_at is null
  and game.starts_at is null and game.expires_at>moment and
  (game.created_at+interval '8 seconds'<=moment or game.ranked_last_seen_at is null or
   game.ranked_last_seen_at<=moment-interval '3 seconds') then
  perform reviewer_play.advance_ranked_queue(game.code,actor,moment);
 end if;
 if game.mode='duel' and game.discoverable and game.host=actor and member.left_at is null
  and game.starts_at is null and game.finished_at is null and game.expires_at>moment
  and (game.created_at+interval '8 seconds'<=moment or game.duel_last_seen_at is null or game.duel_last_seen_at<=moment-interval '3 seconds') then
  perform reviewer_play.advance_duel_queue(game.code,actor,moment);
 end if;
 select * into game from reviewer_play.rooms where code=game.code;
 moment:=clock_timestamp();
 if reviewer_play.room_due(game,moment) then
  perform reviewer_play.settle(game.code,moment);
  select * into game from reviewer_play.rooms where code=game.code;
 end if;
 select * into member from reviewer_play.players where room=game.code and profile=actor;
 begin_at:=case when game.mode='challenge' then member.starts_at else game.starts_at end;
 score_limit:=0;
 if game.finished_at is not null then phase:='finished'; score_limit:=cardinality(game.question_ids);
 elsif member.left_at is not null then
  phase:='finished';
  score_limit:=least(cardinality(game.question_ids),
   greatest(0,coalesce(floor((extract(epoch from (moment-begin_at))+3)/18)::int,0)));
 elsif begin_at is not null then
  elapsed:=extract(epoch from (moment-begin_at));
  if elapsed<0 then phase:='countdown'; closes_at:=begin_at;
  elsif elapsed>=cardinality(game.question_ids)*18 then phase:='finished'; score_limit:=cardinality(game.question_ids);
  else
   current_item:=floor(elapsed/18)::int+1;
   phase:=case when mod(elapsed,18)>=15 then 'reveal' else 'answer' end;
   score_limit:=case when phase='reveal' then current_item else current_item-1 end;
   closes_at:=begin_at+((current_item-1)*18+case when phase='reveal' then 18 else 15 end)*interval '1 second';
   select choice into my_answer from reviewer_play.answers where room=game.code and profile=actor and item=current_item;
   if phase='reveal' then select answer into key_index from reviewer_play.question_pool where id=game.question_ids[current_item]; end if;
  end if;
 end if;
 if game.mode='code' then
  stability:=reviewer_play.team_stability(game.code,score_limit);
 end if;
 if game.ranked_opponent_points is not null then
  simulated_limit:=score_limit;
  if phase='finished' and member.left_at is not null then
   simulated_limit:=least(score_limit,greatest(0,ceil(extract(epoch from (member.left_at-game.starts_at))/18)::int));
  end if;
  select coalesce(sum(points),0)::int,count(*) filter(where points>0)::int
   into simulated_points,simulated_right
  from unnest(game.ranked_opponent_points) with ordinality as opponent(points,item)
  where item<=simulated_limit;
 end if;
 return jsonb_build_object(
  'code',game.code,'mode',game.mode,'subject',game.subject,'topic',game.topic,'phase',phase,'owner',game.host=actor,
  'closed',game.finished_at is not null,'left',member.left_at is not null,
  'searching',game.mode='duel' and game.discoverable and phase='lobby',
  'rejoinable',member.left_at is not null and member.starts_at is null and reviewer_play.can_join(game,moment),
  'serverAt',extract(epoch from moment)*1000,'startsAt',extract(epoch from begin_at)*1000,
  'closesAt',extract(epoch from closes_at)*1000,'expiresAt',extract(epoch from game.expires_at)*1000,
  'finishedAt',extract(epoch from case when phase='finished' and game.mode='challenge'
   then least(moment,game.finished_at,member.left_at,begin_at+cardinality(game.question_ids)*interval '18 seconds')
   else coalesce(game.finished_at,member.left_at) end)*1000,
  'item',current_item,'total',case when game.mode='ranked' then 10 else cardinality(game.question_ids) end,
  'questionId',game.question_ids[current_item],
  'selected',my_answer,'correctIndex',key_index,'stability',stability,
  'matchmakingAt',case when phase='lobby' and (game.mode='ranked' or game.mode='duel' and game.discoverable)
   then extract(epoch from (game.created_at+interval '8 seconds'))*1000 end,
  'rankedResult',member.ranked_result,
  'players',coalesce((select jsonb_agg(entry order by points desc,label) from (
   select p.label,p.profile=actor as me,p.profile=game.host as host,p.left_at is not null as left,
    coalesce(sum(a.points),0)::int as points,count(*) filter(where a.correct)::int as right,false as simulated,false as recorded,
    case when game.mode='challenge' then case
     when p.left_at is not null then 'left'
     when p.starts_at+cardinality(game.question_ids)*interval '18 seconds'<=moment then 'finished'
     when p.starts_at is not null then 'playing'
     else 'waiting'
    end end as status
   from reviewer_play.players p left join reviewer_play.answers a on a.room=p.room and a.profile=p.profile
    and a.item<=case when game.mode='challenge' and game.finished_at is null and p.left_at is null
     then least(score_limit,coalesce(floor((extract(epoch from (moment-p.starts_at))+3)/18)::int,0))
     else score_limit end
   where p.room=game.code and (p.left_at is null or p.profile=actor or game.mode='challenge'
    or p.left_at>=game.starts_at-case when game.mode='cup' then interval '0 seconds' else interval '4 seconds' end)
   group by p.profile,p.label,p.left_at,p.starts_at
   union all
   select coalesce(game.replay_label,'Simulated opponent'),false,false,false,simulated_points,simulated_right,
    game.replay_label is null,game.replay_label is not null,null
   where game.ranked_opponent_points is not null
  ) entry),'[]'::jsonb),
  'review',case when phase='finished' then coalesce((select jsonb_agg(jsonb_build_object(
   'id',game.question_ids[a.item],'choice',a.choice,'right',a.correct) order by a.item)
   from reviewer_play.answers a where a.room=game.code and a.profile=actor),'[]'::jsonb) else '[]'::jsonb end,
  'messages',case when member.left_at is null and phase in ('lobby','finished') and game.mode in ('quiz','code','challenge') then
   coalesce((select jsonb_agg(entry order by id) from (
    select m.id,p.label,m.body,m.profile=actor as me from reviewer_play.messages m
    join reviewer_play.players p using(room,profile) where m.room=game.code order by m.id desc limit 40
   ) entry),'[]'::jsonb) else '[]'::jsonb end
 );
end $$;

create or replace function public.play_message(p_code text,p_body text) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); room_info jsonb;
begin
 room_info:=public.play_room(p_code);
 if room_info->>'phase' not in ('lobby','finished') or room_info->>'mode' not in ('quiz','code','challenge')
  or (room_info->>'left')::boolean
  or p_body is null or char_length(trim(p_body)) not between 1 and 160
  or p_body~*'(https?://|www\.|@|[0-9][0-9 ()+.-]{6,}[0-9])' then return false; end if;
 if exists(select 1 from reviewer_play.messages where room=room_info->>'code' and profile=actor
  and posted_at>clock_timestamp()-interval '3 seconds') then return false; end if;
 insert into reviewer_play.messages(room,profile,body) values(room_info->>'code',actor,trim(p_body));
 return true;
end $$;

create or replace function public.play_replay_sharing(p_enabled boolean) returns boolean
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer();
begin
 if p_enabled is null then raise exception 'Choose whether to share finished rounds.'; end if;
 insert into reviewer_play.replay_sharing(profile,enabled) values(actor,p_enabled)
 on conflict(profile) do update set enabled=excluded.enabled;
 return p_enabled;
end $$;

create or replace function public.play_cup_results() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); moment timestamptz:=clock_timestamp();
 monday date:=date_trunc('week',moment at time zone 'Asia/Manila')::date;
 results jsonb;
begin
 with rounds as (
  select r.cup_day as day,p.profile,p.label,p.joined_at,
   sum(a.points)::int as score,count(*) filter(where a.correct)::int as correct
  from reviewer_play.rooms r
  join reviewer_play.players p on p.room=r.code and p.left_at is null
  join reviewer_play.answers a on a.room=p.room and a.profile=p.profile
  where r.mode='cup' and r.cup_day is not null and r.starts_at+interval '270 seconds'<=moment
  group by r.cup_day,p.profile,p.label,p.joined_at
 ), podiums as (
  select *,row_number() over(partition by day order by score desc,correct desc,joined_at,profile)::int as place
  from rounds
 ), awarded as (
  select *,case place when 1 then 10 when 2 then 6 when 3 then 4 else 0 end as medal_points from podiums
 ), weeks as (
  select date_trunc('week',day::timestamp)::date as week,profile,(array_agg(label order by day desc))[1] as label,
   sum(medal_points)::int as points,sum(score)::int as total_score,
   count(*) filter(where place=1)::int as wins,count(*) filter(where place<=3)::int as medals
  from awarded where day>=monday-7 group by 1,profile having sum(medal_points)>0
 ), champions as (
  select profile,(array_agg(label order by day desc))[1] as label,
   count(*) filter(where place=1)::int as wins,max(score) as best
  from awarded group by profile having count(*) filter(where place=1)>0
 ), latest as (
  select max(day) as day from podiums
 )
 select jsonb_build_object(
  'latest', (select jsonb_build_object('day',latest.day,'players',count(*),'podium',
   jsonb_agg(jsonb_build_object('place',place,'label',label,'score',score,'correct',correct,'me',profile=actor) order by place) filter(where place<=3))
   from podiums join latest on podiums.day=latest.day group by latest.day),
  'weekStart',monday,
  'week',coalesce((select jsonb_agg(entry order by position) from (
   select row_number() over(order by points desc,total_score desc,profile) as position,label,points,wins,medals,profile=actor as me
   from weeks where week=monday order by points desc,total_score desc,profile limit 10
  ) entry),'[]'::jsonb),
  'myWeekPoints',coalesce((select points from weeks where week=monday and profile=actor),0),
  'previousChampion',(select jsonb_build_object('label',label,'points',points,'wins',wins,'medals',medals,'me',profile=actor)
   from weeks where week=monday-7 order by points desc,total_score desc,profile limit 1),
  'hall',coalesce((select jsonb_agg(entry order by position) from (
   select row_number() over(order by wins desc,best desc,profile) as position,label,wins,best,profile=actor as me
   from champions order by wins desc,best desc,profile limit 10
  ) entry),'[]'::jsonb)
 ) into results;
 return results;
end $$;

create or replace function public.play_overview() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); moment timestamptz:=clock_timestamp(); season_key text:=reviewer_play.season(moment);
 today_cup timestamptz:=reviewer_play.cup_start(moment);
 next_cup timestamptz:=case when moment<today_cup then today_cup else reviewer_play.cup_start(moment+interval '1 day') end;
 leaders jsonb; position int;
begin
 perform reviewer_play.finish_due_ranked(actor,moment);
 with ladder as (
  select profile,label,tier,stars,wins,row_number() over(order by tier desc,stars desc,wins desc,label,profile) as place
  from reviewer_play.ranks where season=season_key and matches>=3
 )
 select min(place) filter(where profile=actor),coalesce(jsonb_agg(jsonb_build_object('label',label,'tier',tier,'stars',stars,'wins',wins,'me',profile=actor) order by place) filter(where place<=10),'[]'::jsonb)
 into position,leaders from ladder;
 return jsonb_build_object('season',season_key,
  'cup',jsonb_build_object('opensAt',extract(epoch from (next_cup-interval '15 minutes'))*1000,
   'startsAt',extract(epoch from next_cup)*1000,'canJoin',moment>=today_cup-interval '15 minutes' and moment<today_cup),
  'rank',coalesce((select to_jsonb(r)-'profile'-'label' from reviewer_play.ranks r where profile=actor and season=season_key),
   jsonb_build_object('tier',reviewer_play.ranked_tier(actor,season_key),'stars',0,'matches',0,'wins',0,'losses',0)),
  'leaders',leaders,'rankPosition',position,
  'replaySharing',coalesce((select enabled from reviewer_play.replay_sharing where profile=actor),false),
  'openRooms',coalesce((select jsonb_agg(entry) from (
   select r.code,r.mode,r.subject,p.label from reviewer_play.rooms r join reviewer_play.players p on p.room=r.code and p.profile=r.host
   where r.discoverable and r.mode in ('quiz','code') and r.starts_at is null and r.finished_at is null and r.expires_at>clock_timestamp()
    and (select count(*) from reviewer_play.players members where members.room=r.code and members.left_at is null)<reviewer_play.limit_for(r.mode)
   order by r.created_at desc limit 12
  ) entry),'[]'::jsonb),
  'recent',coalesce((select jsonb_agg(entry) from (
   select r.code,r.mode,r.subject,(r.finished_at is not null or r.expires_at<=moment or
    coalesce((case when r.mode='challenge' then p.starts_at else r.starts_at end)
     +cardinality(r.question_ids)*interval '18 seconds'<=moment,false)) as ended
   from reviewer_play.players p join reviewer_play.rooms r on r.code=p.room
   where p.profile=actor and p.left_at is null order by p.joined_at desc limit 12
  ) entry),'[]'::jsonb)
 );
end $$;

revoke execute on all functions in schema reviewer_play from public, anon, authenticated;
revoke all on function public.play_cup_results(),public.play_replay_sharing(boolean) from public,anon;
grant execute on function public.play_cup_results(),public.play_replay_sharing(boolean) to authenticated;
revoke all on function public.play_open(text,text,text,boolean),public.play_join(text),public.play_room_action(text,text),
 public.play_answer(text,integer,integer),public.play_room(text),public.play_message(text,text),public.play_overview() from public,anon;
grant execute on function public.play_open(text,text,text,boolean),public.play_join(text),public.play_room_action(text,text),
 public.play_answer(text,integer,integer),public.play_room(text),public.play_message(text,text),public.play_overview() to authenticated;
notify pgrst,'reload schema';
commit;
