import { useEffect } from "react";
import { callPlay } from "./play-api";

export function usePlayPresence(profileId: string, route: string) {
  const activity = /^\/play(?:\/|$)/.test(route) ? "play"
    : /^\/(practice|session|results|topics|mock|decks|resources|questions|vault|schedule)(?:\/|$)/.test(route) ? "study" : "online";

  useEffect(() => {
    if (!profileId) return;
    const controller = new AbortController();
    let pending = false;
    const heartbeat = async () => {
      if (pending || controller.signal.aborted || document.visibilityState !== "visible") return;
      pending = true;
      try { await callPlay<boolean>("play_presence", { p_activity: activity }, controller.signal); }
      catch { /* Activity expires when the connection is unavailable. */ }
      finally { pending = false; }
    };
    void heartbeat();
    const interval = window.setInterval(heartbeat, 30000);
    document.addEventListener("visibilitychange", heartbeat);
    window.addEventListener("online", heartbeat);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", heartbeat);
      window.removeEventListener("online", heartbeat);
    };
  }, [profileId, activity]);
}
