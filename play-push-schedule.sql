-- Apply after play-social.sql and after deploying /api/play-push to this origin.
begin;
create extension if not exists pg_cron;
create extension if not exists http with schema extensions;
alter table reviewer_play.push_config add column if not exists last_http_status integer;

-- The credential is sent directly over HTTPS and never stored in pg_net's queue.
create or replace function reviewer_play.run_push_schedule() returns void
language plpgsql security definer set search_path='' as $$
declare moment timestamptz:=clock_timestamp(); token text; response_code integer;
 cup_start timestamptz:=reviewer_play.cup_start(moment);
 cup_key text:='cup:'||(cup_start at time zone 'Asia/Manila')::date;
begin
 if not exists(select 1 from reviewer_play.push_config where singleton and vapid_public is null)
  and not exists(select 1 from reviewer_play.push_queue where not done and tries<4 and ready_at<=moment and expires_at>moment)
  and not (moment>=cup_start-interval '15 minutes' and moment<cup_start and exists(
   select 1 from reviewer_play.push_subscriptions s where s.cup_reminders
    and not exists(select 1 from reviewer_play.push_queue q where q.subscription=s.id and q.event_key=cup_key)
  )) then return; end if;
 select worker_token into strict token from reviewer_play.push_config where singleton;
 perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','20000');
 select response.status into response_code from extensions.http((
  'POST','https://nlereviewer.vercel.app/api/play-push',array[extensions.http_header('X-NLE-Push-Worker',token)],
  'application/json','{}'
 )::extensions.http_request) response;
 update reviewer_play.push_config set last_wake_at=clock_timestamp(),last_http_status=response_code where singleton;
 delete from reviewer_play.push_queue where expires_at<moment-interval '1 day';
end $$;

drop trigger if exists reviewer_play_push_notify on reviewer_play.push_queue;
drop function if exists reviewer_play.on_push_queued();
drop function if exists reviewer_play.wake_push_worker();
revoke execute on function reviewer_play.run_push_schedule() from public,anon,authenticated;

select cron.schedule('nle-reviewer-play-push','20 seconds','select reviewer_play.run_push_schedule();');
select cron.alter_job(jobid,active:=true) from cron.job where jobname='nle-reviewer-play-push';
commit;
