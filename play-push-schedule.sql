-- Apply after play-social.sql and after deploying /api/play-push to this origin.
begin;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function reviewer_play.wake_push_worker() returns void
language plpgsql security definer set search_path='' as $$
declare moment timestamptz:=clock_timestamp(); token text;
begin
 if not exists(select 1 from reviewer_play.push_config where singleton and vapid_public is null)
  and not exists(select 1 from reviewer_play.push_queue where not done and tries<4 and ready_at<=moment and expires_at>moment) then return; end if;
 update reviewer_play.push_config set last_wake_at=moment
 where singleton and (last_wake_at is null or last_wake_at<=moment-interval '3 seconds') returning worker_token into token;
 if token is null then return; end if;
 perform net.http_post(
  url:='https://nlereviewer.vercel.app/api/play-push',
  headers:=jsonb_build_object('Content-Type','application/json','X-NLE-Push-Worker',token),
  body:='{}'::jsonb,timeout_milliseconds:=20000
 );
end $$;

create or replace function reviewer_play.on_push_queued() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 perform reviewer_play.wake_push_worker();
 return null;
end $$;

create or replace function reviewer_play.run_push_schedule() returns void
language plpgsql security definer set search_path='' as $$
declare moment timestamptz:=clock_timestamp();
begin
 perform reviewer_play.queue_cup_reminders(moment);
 perform reviewer_play.wake_push_worker();
 delete from reviewer_play.push_queue where expires_at<moment-interval '1 day';
end $$;

drop trigger if exists reviewer_play_push_notify on reviewer_play.push_queue;
create trigger reviewer_play_push_notify after insert on reviewer_play.push_queue
for each row execute function reviewer_play.on_push_queued();
revoke execute on function reviewer_play.wake_push_worker(),reviewer_play.on_push_queued(),reviewer_play.run_push_schedule() from public,anon,authenticated;

select cron.schedule('nle-reviewer-play-push','* * * * *','select reviewer_play.run_push_schedule();');
select reviewer_play.run_push_schedule();
commit;
