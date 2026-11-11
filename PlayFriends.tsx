import { useEffect, useRef, useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { callPlay, playErrorMessage } from "./play-api";
import { useApp } from "./store";
import { Card } from "./ui";

type Activity = "online" | "study" | "play" | "offline" | "hidden";
type Friend = { label: string; relationship: "accepted" | "incoming" | "outgoing"; activity: Activity; seenAt: number | null };
type Invite = { id: string; label: string; expiresAt: number };
type SocialOverview = { serverAt: number; sharing: boolean; friends: Friend[]; invites: Invite[] };

function activityLabel(friend: Friend, serverAt: number) {
  if (friend.activity === "study") return "Studying now";
  if (friend.activity === "play") return "Playing now";
  if (friend.activity === "online") return "Online";
  if (friend.activity === "hidden") return "Activity hidden";
  if (!friend.seenAt) return "Offline";
  const minutes = Math.max(1, Math.floor((serverAt - friend.seenAt) / 60000));
  if (minutes < 60) return `Active ${minutes} min ago`;
  if (minutes < 1440) return `Active ${Math.floor(minutes / 60)} h ago`;
  return `Active ${Math.floor(minutes / 1440)} d ago`;
}

export function PlayFriends() {
  const { path, navigate, toast } = useApp();
  const [social, setSocial] = useState<SocialOverview>();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const inviteList = useRef<HTMLElement>(null);
  const targetedInvite = new URLSearchParams(path.split("?")[1]).get("invite");
  const hasTarget = social?.invites.some(invite => invite.id === targetedInvite);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const data = await callPlay<SocialOverview>("play_social_overview", {}, controller.signal);
        if (!controller.signal.aborted) { setSocial(data); setError(""); }
      } catch (failure) {
        if (!controller.signal.aborted) setError(playErrorMessage(failure));
      } finally { pending = false; }
    }
    void load();
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 7000);
    document.addEventListener("visibilitychange", load);
    window.addEventListener("online", load);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", load);
      window.removeEventListener("online", load);
    };
  }, [refresh]);

  useEffect(() => {
    if (hasTarget || targetedInvite && social) inviteList.current?.scrollIntoView({ block: "start" });
  // Refreshing activity should not keep scrolling away from the current control.
  }, [hasTarget, targetedInvite, !!social]);

  async function change(action: () => Promise<unknown>) {
    setRequestError("");
    setBusy(true);
    try { await action(); setRefresh(value => value + 1); }
    catch (failure) { setRequestError(playErrorMessage(failure)); }
    finally { setBusy(false); }
  }

  function friendAction(action: "request" | "accept" | "remove", label: string) {
    return change(async () => {
      const ok = await callPlay<boolean>("play_friend_action", { p_action: action, p_username: label.normalize("NFKC").trim() });
      if (!ok) throw new Error(action === "request" ? "No other study profile was found with that username." : "That friend request is no longer available.");
      if (action === "request") setUsername("");
      if (action === "accept") void callPlay<boolean>("play_presence", { p_activity: "play" }).catch(() => undefined);
    });
  }

  function reply(invite: Invite, accept: boolean) {
    return change(async () => {
      const room = await callPlay<string | null>("play_friend_reply", { p_invite: invite.id, p_accept: accept });
      if (accept && room) navigate(`/play/room/${room}`);
    });
  }

  return <Card className="play-friends">
    <h2><Users size={20} aria-hidden="true"/> Friends</h2>
    {error ? <div className="button-row"><p role="status">Friend activity could not load.</p><button className="btn small" onClick={() => setRefresh(value => value + 1)}>Retry</button></div>
      : !social ? <p role="status">Checking friends…</p> : <>
        <section ref={inviteList} className="play-invites">
          {social.invites.length > 0 && <><h3>Live invitations</h3><ul className="play-people">
            {social.invites.map(invite => <li key={invite.id} className={invite.id === targetedInvite ? "invite-target" : ""}>
              <span><strong>{invite.label}</strong><small>Invited you to a Live Match</small></span>
              <div className="button-row"><button className="btn small primary" disabled={busy} onClick={() => void reply(invite, true)}>Join match</button>
                <button className="btn small" disabled={busy} onClick={() => void reply(invite, false)}>Dismiss</button></div>
            </li>)}
          </ul></>}
          {targetedInvite && !hasTarget && <p role="status">That invitation is no longer waiting for you.</p>}
        </section>
        {social.friends.length > 0 && <ul className="play-people">
          {social.friends.map(friend => <li key={friend.label}>
            <span><strong>{friend.label}</strong><small className={friend.activity === "online" || friend.activity === "study" || friend.activity === "play" ? "friend-online" : undefined}>
              {friend.relationship === "accepted" ? activityLabel(friend, social.serverAt) : friend.relationship === "incoming" ? "Friend request" : "Request sent"}
            </small></span>
            <div className="button-row">
              {friend.relationship === "incoming" && <button className="btn small primary" disabled={busy} onClick={() => void friendAction("accept", friend.label)}>Accept</button>}
              {friend.relationship === "accepted" && <button className="btn small primary" disabled={busy} onClick={() => void change(async () => {
                const room = await callPlay<string>("play_friend_invite", { p_username: friend.label });
                toast("Live invitation sent.");
                navigate(`/play/room/${room}`);
              })}>Play live<ArrowRight size={14}/></button>}
              <button className="btn small" disabled={busy} aria-label={`${friend.relationship === "accepted" ? "Remove" : "Dismiss request from"} ${friend.label}`} onClick={() => void friendAction("remove", friend.label)}>
                {friend.relationship === "accepted" ? "Remove" : friend.relationship === "incoming" ? "Dismiss" : "Cancel"}
              </button>
            </div>
          </li>)}
        </ul>}
        <form className="friend-request" onSubmit={event => { event.preventDefault(); if (username.trim()) void friendAction("request", username); }}>
          <label>Friend’s username<input value={username} onChange={event => setUsername(event.target.value)} autoCapitalize="none" autoComplete="off" maxLength={40}/></label>
          <button className="btn" disabled={busy || !username.trim()}>Send request</button>
        </form>
        <label className="game-check"><input type="checkbox" checked={social.sharing} disabled={busy} onChange={event => {
          const sharing = event.target.checked;
          void change(async () => {
            await callPlay<boolean>("play_share_presence", { p_sharing: sharing });
            if (sharing) await callPlay<boolean>("play_presence", { p_activity: "play" });
          });
        }}/>Show my activity to accepted friends</label>
      </>}
    {requestError && <p className="form-error" role="alert">{requestError}</p>}
  </Card>;
}
