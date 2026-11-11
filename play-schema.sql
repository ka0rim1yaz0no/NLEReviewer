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
alter table reviewer_play.rooms add column if not exists ranked_opponent_points smallint[];
alter table reviewer_play.players add column if not exists ranked_result jsonb;
create index if not exists reviewer_play_players_history on reviewer_play.players(profile,joined_at desc);
create index if not exists reviewer_play_ranked_queue on reviewer_play.rooms(created_at)
 where mode='ranked' and starts_at is null and finished_at is null;
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
revoke all on all tables in schema reviewer_play from public, anon, authenticated;
alter table reviewer_play.question_pool enable row level security;
alter table reviewer_play.rooms enable row level security;
alter table reviewer_play.players enable row level security;
alter table reviewer_play.answers enable row level security;
alter table reviewer_play.ranks enable row level security;
alter table reviewer_play.messages enable row level security;

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

create or replace function reviewer_play.settle(room_code text, moment timestamptz) returns void
language plpgsql security definer set search_path='' as $$
declare game reviewer_play.rooms%rowtype; player record; rank reviewer_play.ranks%rowtype;
 other_score int; won boolean; lost boolean; gain int; tier_after int; stars_after int; current_season text;
 opponent_left boolean; rank_before int; star_change int; has_answers boolean; someone_left boolean;
begin
 select * into game from reviewer_play.rooms where code=room_code for update;
 if not found or game.finished_at is not null then return; end if;
 if game.mode='challenge' then
  if moment<game.expires_at and (
    (select count(*) from reviewer_play.players where room=room_code)<2
    or exists(select 1 from reviewer_play.players where room=room_code and left_at is null
     and (starts_at is null or starts_at+interval '180 seconds'>moment))
   ) then return; end if;
 elsif game.starts_at is null then
  if moment<game.expires_at then return; end if;
 elsif moment<game.starts_at+cardinality(game.question_ids)*interval '18 seconds'
  and not (game.mode in ('duel','ranked') and exists(select 1 from reviewer_play.players where room=room_code and left_at is not null))
 then return;
 end if;
 update reviewer_play.rooms set finished_at=case when game.mode='ranked' and game.starts_at is not null
  then least(moment,game.starts_at+cardinality(game.question_ids)*interval '18 seconds') else moment end
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
 moment timestamptz:=clock_timestamp(); today date:=(moment at time zone 'Asia/Manila')::date;
 cup_start timestamptz:=((today+time '21:00') at time zone 'Asia/Manila');
 actor_tier int; opponent uuid; season_key text;
begin
 if p_mode not in ('duel','ranked','challenge','quiz','code','cup') or p_mode is null then raise exception 'Choose a game mode.'; end if;
 if p_subject not in ('all','CROSS','NP1','NP2','NP3','NP4','NP5') or p_subject is null or length(coalesce(p_topic,''))>100 then raise exception 'Choose a valid subject.'; end if;
 select username into strict label_text from public.study_profiles where user_id=actor;
 perform pg_advisory_xact_lock(hashtext('reviewer-play-lobby'));
 if p_mode='ranked' then
  moment:=clock_timestamp();
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
  if moment<cup_start-interval '15 minutes' or moment>=cup_start then raise exception 'The nightly lobby is open from 8:45 to 9:00 PM Philippine time.'; end if;
  select code into code_text from reviewer_play.rooms where cup_day=today;
  if code_text is not null then
   if not exists(select 1 from reviewer_play.players where room=code_text and profile=actor)
    and (select count(*) from reviewer_play.players where room=code_text)>=40 then raise exception 'The nightly lobby is full.'; end if;
   insert into reviewer_play.players(room,profile,label) values(code_text,actor,label_text) on conflict do nothing;
   return code_text;
  end if;
 elsif p_mode='duel' and p_public then
  select code into code_text from reviewer_play.rooms r
   where r.host=actor and r.mode=p_mode and r.discoverable and r.starts_at is null and r.finished_at is null and r.expires_at>moment
   order by created_at desc limit 1;
  if code_text is not null then return code_text; end if;
  select r.code into code_text from reviewer_play.rooms r
   where r.host<>actor and r.mode=p_mode and r.discoverable and r.starts_at is null and r.finished_at is null
    and r.expires_at>moment and r.subject=p_subject and r.topic=coalesce(p_topic,'')
   order by r.created_at limit 1 for update of r;
  if code_text is not null then
   insert into reviewer_play.players(room,profile,label) values(code_text,actor,label_text);
   update reviewer_play.rooms set starts_at=moment+interval '4 seconds',expires_at=moment+interval '10 minutes' where code=code_text;
   return code_text;
  end if;
 end if;
 if (select count(*) from reviewer_play.rooms where host=actor and starts_at is null and finished_at is null and expires_at>moment)>=5
 then raise exception 'Close an unused lobby before opening another.'; end if;
 selected:=reviewer_play.draw(p_subject,coalesce(p_topic,''),case when p_mode='cup' then 15 else 10 end);
 if cardinality(selected)<(case when p_mode='cup' then 15 else 10 end) then raise exception 'There are not enough game questions for that selection.'; end if;
 insert into reviewer_play.rooms(mode,host,subject,topic,discoverable,question_ids,expires_at,starts_at,cup_day)
 values(p_mode,actor,p_subject,coalesce(p_topic,''),coalesce(p_public,false),selected,
  moment+case when p_mode='duel' and p_public then interval '2 minutes' else interval '1 day' end,
  case when p_mode='cup' then cup_start end,case when p_mode='cup' then today end)
 returning code into code_text;
 insert into reviewer_play.players(room,profile,label) values(code_text,actor,label_text);
 return code_text;
end $$;

create or replace function public.play_join(p_code text) returns text
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); game reviewer_play.rooms%rowtype; label_text text; moment timestamptz:=clock_timestamp();
begin
 select * into game from reviewer_play.rooms where code=upper(trim(p_code)) for update;
 if not found then raise exception 'That room code was not found.'; end if;
 if exists(select 1 from reviewer_play.players where room=game.code and profile=actor) then return game.code; end if;
 if game.mode='ranked' or game.finished_at is not null or game.expires_at<=moment
  or game.mode not in ('challenge','cup') and game.starts_at is not null
  or game.mode='cup' and moment>=game.starts_at
 then raise exception 'This room is closed to new players.'; end if;
 if (select count(*) from reviewer_play.players where room=game.code and left_at is null)>=reviewer_play.limit_for(game.mode)
 then raise exception 'This room is full.'; end if;
 select username into strict label_text from public.study_profiles where user_id=actor;
 insert into reviewer_play.players(room,profile,label) values(game.code,actor,label_text);
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
 if game.mode='ranked' then
  moment:=clock_timestamp();
  if p_action='cancel' then
   if game.starts_at is not null then return false; end if;
   if game.finished_at is null then
    update reviewer_play.players set left_at=moment where room=game.code and profile=actor;
    update reviewer_play.rooms set finished_at=moment where code=game.code;
   end if;
   return true;
  end if;
  if game.finished_at is not null or member.left_at is not null then return p_action='leave'; end if;
  if game.expires_at<=moment or game.starts_at+cardinality(game.question_ids)*interval '18 seconds'<=moment then
   perform reviewer_play.settle(game.code,moment);
   return p_action='leave';
  end if;
 end if;
 if game.finished_at is not null or game.expires_at<=moment or member.left_at is not null then return false; end if;
 if p_action='leave' then
  update reviewer_play.players set left_at=moment where room=game.code and profile=actor;
  if actor=game.host and game.starts_at is null and game.mode<>'challenge' then
   update reviewer_play.rooms set finished_at=moment where code=game.code;
  end if;
  perform reviewer_play.settle(game.code,moment);
  return true;
 end if;
 if p_action<>'start' or p_action is null then return false; end if;
 if game.mode='challenge' and member.starts_at is null then
  update reviewer_play.players set starts_at=moment+interval '4 seconds' where room=game.code and profile=actor;
  return true;
 end if;
 if game.mode in ('quiz','code','duel') and game.starts_at is null and actor=game.host
  and (select count(*) from reviewer_play.players where room=game.code and left_at is null)>=2 then
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
 select * into member from reviewer_play.players where room=game.code and profile=actor;
 if member.profile is null then raise exception 'Join the room first.' using errcode='42501'; end if;
 if game.mode='ranked' and game.finished_at is null and member.left_at is null
  and game.starts_at is null and game.expires_at>moment and
  (game.created_at+interval '8 seconds'<=moment or game.ranked_last_seen_at is null or
   game.ranked_last_seen_at<=moment-interval '3 seconds') then
  perform reviewer_play.advance_ranked_queue(game.code,actor,moment);
  select * into game from reviewer_play.rooms where code=game.code;
 end if;
 moment:=clock_timestamp();
 if game.mode<>'ranked' or (game.finished_at is null and
  (game.expires_at<=moment or game.starts_at+cardinality(game.question_ids)*interval '18 seconds'<=moment)) then
  perform reviewer_play.settle(game.code,moment);
 end if;
 select * into game from reviewer_play.rooms where code=game.code;
 select * into member from reviewer_play.players where room=game.code and profile=actor;
 begin_at:=case when game.mode='challenge' then member.starts_at else game.starts_at end;
 score_limit:=0;
 if game.finished_at is not null or member.left_at is not null then phase:='finished'; score_limit:=cardinality(game.question_ids);
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
  select greatest(0,least(100,100+coalesce(sum(case when success then 2 else -12 end),0)))::int into stability
  from (select exists(select 1 from reviewer_play.answers a where a.room=game.code and a.item=i and a.correct) success
   from generate_series(1,score_limit) i) rounds;
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
  'serverAt',extract(epoch from moment)*1000,'startsAt',extract(epoch from begin_at)*1000,
  'closesAt',extract(epoch from closes_at)*1000,'expiresAt',extract(epoch from game.expires_at)*1000,
  'finishedAt',extract(epoch from game.finished_at)*1000,
  'item',current_item,'total',case when game.mode='ranked' then 10 else cardinality(game.question_ids) end,
  'questionId',game.question_ids[current_item],
  'selected',my_answer,'correctIndex',key_index,'stability',stability,
  'matchmakingAt',case when game.mode='ranked' and phase='lobby' then extract(epoch from (game.created_at+interval '8 seconds'))*1000 end,
  'rankedResult',member.ranked_result,
  'players',coalesce((select jsonb_agg(entry order by points desc,label) from (
   select p.label,p.profile=actor as me,p.profile=game.host as host,p.left_at is not null as left,
    coalesce(sum(a.points),0)::int as points,count(*) filter(where a.correct)::int as right,false as simulated
   from reviewer_play.players p left join reviewer_play.answers a on a.room=p.room and a.profile=p.profile and a.item<=score_limit
   where p.room=game.code group by p.profile,p.label,p.left_at
   union all
   select 'Simulated opponent',false,false,false,simulated_points,simulated_right,true
   where game.ranked_opponent_points is not null
  ) entry),'[]'::jsonb),
  'review',case when phase='finished' then coalesce((select jsonb_agg(jsonb_build_object(
   'id',game.question_ids[a.item],'choice',a.choice,'right',a.correct) order by a.item)
   from reviewer_play.answers a where a.room=game.code and a.profile=actor),'[]'::jsonb) else '[]'::jsonb end,
  'messages',case when phase in ('lobby','finished') and game.mode in ('quiz','code','challenge') then
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
  or p_body is null or char_length(trim(p_body)) not between 1 and 160
  or p_body~*'(https?://|www\.|@|[0-9][0-9 ()+.-]{6,}[0-9])' then return false; end if;
 if exists(select 1 from reviewer_play.messages where room=room_info->>'code' and profile=actor
  and posted_at>clock_timestamp()-interval '3 seconds') then return false; end if;
 insert into reviewer_play.messages(room,profile,body) values(room_info->>'code',actor,trim(p_body));
 return true;
end $$;

create or replace function public.play_overview() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=reviewer_play.viewer(); moment timestamptz:=clock_timestamp(); season_key text:=reviewer_play.season(moment);
begin
 perform reviewer_play.finish_due_ranked(actor,moment);
 return jsonb_build_object('season',season_key,
  'rank',coalesce((select to_jsonb(r)-'profile'-'label' from reviewer_play.ranks r where profile=actor and season=season_key),
   jsonb_build_object('tier',reviewer_play.ranked_tier(actor,season_key),'stars',0,'matches',0,'wins',0,'losses',0)),
  'leaders',coalesce((select jsonb_agg(entry) from (
   select label,stars,wins from reviewer_play.ranks where season=season_key and tier=4 order by stars desc,wins desc,label limit 10
  ) entry),'[]'::jsonb),
  'openRooms',coalesce((select jsonb_agg(entry) from (
   select r.code,r.mode,r.subject,p.label from reviewer_play.rooms r join reviewer_play.players p on p.room=r.code and p.profile=r.host
   where r.discoverable and r.mode in ('quiz','code') and r.starts_at is null and r.finished_at is null and r.expires_at>clock_timestamp()
   order by r.created_at desc limit 12
  ) entry),'[]'::jsonb),
  'recent',coalesce((select jsonb_agg(entry) from (
   select r.code,r.mode,r.subject,r.finished_at is not null or r.expires_at<=moment as ended
   from reviewer_play.players p join reviewer_play.rooms r on r.code=p.room
   where p.profile=actor and p.left_at is null order by p.joined_at desc limit 12
  ) entry),'[]'::jsonb)
 );
end $$;

revoke execute on all functions in schema reviewer_play from public, anon, authenticated;
revoke all on function public.play_open(text,text,text,boolean),public.play_join(text),public.play_room_action(text,text),
 public.play_answer(text,integer,integer),public.play_room(text),public.play_message(text,text),public.play_overview() from public,anon;
grant execute on function public.play_open(text,text,text,boolean),public.play_join(text),public.play_room_action(text,text),
 public.play_answer(text,integer,integer),public.play_room(text),public.play_message(text,text),public.play_overview() to authenticated;
notify pgrst,'reload schema';
commit;
