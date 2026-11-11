import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { callPlay, playErrorMessage } from "./play-api";
import { Card } from "./ui";

type Reminder = "friend" | "cup";
type ReminderSettings = { publicKey: string | null; friend: boolean; cup: boolean };

function unsupportedMessage() {
  const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const installed = matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  if (appleMobile && !installed) return "On iPhone or iPad, add NLEReviewer to your Home Screen and open it there to turn on reminders.";
  if (!window.isSecureContext || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "This browser cannot receive web push. Live invitations still appear under Friends.";
  }
  return "";
}

async function reminderWorker() {
  const registration = await navigator.serviceWorker.register("/play-push-sw.js", { scope: "/" });
  if (registration.active) return registration;
  const timeout = AbortSignal.timeout(8000);
  return Promise.race([navigator.serviceWorker.ready, new Promise<never>((_, reject) => {
    timeout.addEventListener("abort", () => reject(new Error("The reminder service could not start. Try again.")), { once: true });
  })]);
}

function pushKey(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
}

export function PlayReminders({ cupOnly = false }: { cupOnly?: boolean }) {
  const unsupported = unsupportedMessage();
  const [settings, setSettings] = useState<ReminderSettings>();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (unsupported) return;
    const controller = new AbortController();
    async function load() {
      try {
        const worker = await reminderWorker();
        const subscription = await worker.pushManager.getSubscription();
        const values = await callPlay<ReminderSettings>("play_push_settings", { p_endpoint: subscription?.endpoint ?? null }, controller.signal);
        if (!controller.signal.aborted) { setSettings(values); setLoadError(false); }
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [refresh, unsupported]);

  async function toggle(kind: Reminder) {
    if (!settings?.publicKey || pending) return;
    const enabling = !settings[kind];
    setPending(true);
    setMessage("");
    try {
      // Request permission during the button gesture, before asynchronous registration.
      const permission = enabling && Notification.permission === "default"
        ? Notification.requestPermission() : Promise.resolve(Notification.permission);
      if (enabling && await permission !== "granted") throw new Error("Allow notifications in your browser or device settings to turn on reminders.");
      const worker = await reminderWorker();
      const next = { ...settings, [kind]: enabling };
      const key = pushKey(settings.publicKey);
      let subscription = await worker.pushManager.getSubscription();
      if (enabling && subscription) {
        const registered = subscription.options.applicationServerKey;
        const currentKey = registered ? new Uint8Array(registered) : undefined;
        if (currentKey && (currentKey.length !== key.length || !key.every((value, index) => value === currentKey[index]))) {
          await subscription.unsubscribe();
          subscription = null;
        }
      }
      if (enabling && !subscription) subscription = await worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      const data = subscription?.toJSON();
      if (!data?.endpoint || !data.keys?.p256dh || !data.keys.auth) throw new Error("The browser did not return a valid push subscription.");
      await callPlay<boolean>("play_push_save", {
        p_endpoint: data.endpoint, p_p256dh: data.keys.p256dh, p_auth: data.keys.auth, p_friend: next.friend, p_cup: next.cup,
      });
      setSettings(next);
      if (!next.friend && !next.cup) await subscription?.unsubscribe().catch(() => false);
    } catch (failure) {
      setMessage(playErrorMessage(failure));
    } finally { setPending(false); }
  }

  async function test() {
    setPending(true);
    setMessage("");
    try {
      const subscription = await (await reminderWorker()).pushManager.getSubscription();
      if (!subscription || !await callPlay<boolean>("play_push_test", { p_endpoint: subscription.endpoint })) {
        throw new Error("Turn on a reminder on this device first.");
      }
      setMessage("Test notification queued. Check your device notifications.");
    } catch (failure) { setMessage(playErrorMessage(failure)); }
    finally { setPending(false); }
  }

  const reminders: Reminder[] = cupOnly ? ["cup"] : ["friend", "cup"];
  return <section id="play-reminders" className="play-reminders-anchor">
    <Card className="play-reminders">
      <h2><Bell size={20} aria-hidden="true"/> Push reminders</h2>
      {unsupported ? <p>{unsupported}</p> : loadError || settings && !settings.publicKey ? <>
        <p role="status">Push reminders are temporarily unavailable.</p>
        <button className="btn small" onClick={() => { setLoadError(false); setRefresh(value => value + 1); }}>Retry</button>
      </> : !settings ? <p role="status">Checking this device…</p> : <>
        {reminders.map(kind => <div className="play-reminder-row" key={kind}>
          <span><strong>{kind === "friend" ? "Friend invites" : "Nightly Cup"}</strong>
            <small>{kind === "friend" ? "When a friend invites you to a Live Match" : "When the lobby opens at 8:45 PM Philippine time"}</small></span>
          <button className="btn small" type="button" role="switch" aria-label={kind === "friend" ? "Friend invite reminders" : "Nightly Cup reminders"}
            aria-checked={settings[kind]} disabled={pending} onClick={() => void toggle(kind)}>{settings[kind] ? "On" : "Turn on"}</button>
        </div>)}
        {(settings.friend || settings.cup) && <button className="btn small" disabled={pending} onClick={() => void test()}>Send a test notification</button>}
      </>}
      {message && <p role="status">{message}</p>}
    </Card>
  </section>;
}
