import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { callPlay, playErrorMessage } from "./play-api";
import { Card } from "./ui";

type Reminder = "friend" | "cup";
type ReminderSettings = { publicKey: string | null; friend: boolean; cup: boolean };
type ReminderDevice = { manager: PushManager; settings: ReminderSettings };

const deniedMessage = "Allow notifications in your browser or device settings to turn on reminders.";

function nativePushManager() {
  return (window as Window & { pushManager?: PushManager }).pushManager;
}

function unsupportedMessage() {
  const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const installed = matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  if (appleMobile && !installed) return "On iPhone or iPad, choose Add to Home Screen from the Share menu. Open NLEReviewer from its new icon, sign in, and turn on reminders in Play.";
  const supportsPush = nativePushManager() || "serviceWorker" in navigator && "PushManager" in window;
  if (!window.isSecureContext || !supportsPush || !("Notification" in window)) {
    return "This browser cannot receive web push. Live invitations still appear under Friends.";
  }
  return "";
}

function withDeviceTimeout<T>(response: Promise<T>, milliseconds: number, message: string) {
  let timer: number | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), milliseconds);
  });
  return Promise.race([response, deadline]).finally(() => window.clearTimeout(timer));
}

async function reminderManager() {
  const manager = nativePushManager();
  if (manager) return manager;
  const message = "The reminder service could not start. Try again.";
  const registration = await withDeviceTimeout(navigator.serviceWorker.register("/play-push-sw.js", { scope: "/" }), 8000, message);
  const active = registration.active ? registration : await withDeviceTimeout(navigator.serviceWorker.ready, 8000, message);
  return active.pushManager;
}

function deviceSubscription(manager: PushManager) {
  return withDeviceTimeout(manager.getSubscription(), 8000, "The device did not return its reminder settings. Try again.");
}

function pushKey(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
}

export function PlayReminders({ cupOnly = false }: { cupOnly?: boolean }) {
  const unsupported = unsupportedMessage();
  const [device, setDevice] = useState<ReminderDevice>();
  const settings = device?.settings;
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (unsupported) return;
    const controller = new AbortController();
    async function load() {
      try {
        const manager = await reminderManager();
        const subscription = await deviceSubscription(manager);
        let values = await callPlay<ReminderSettings>("play_push_settings", { p_endpoint: subscription?.endpoint ?? null }, controller.signal);
        const registered = subscription?.options.applicationServerKey;
        if (subscription && registered && values.publicKey && !controller.signal.aborted) {
          const key = pushKey(values.publicKey);
          const currentKey = new Uint8Array(registered);
          if (currentKey.length !== key.length || !key.every((value, index) => value === currentKey[index])) {
            await withDeviceTimeout(subscription.unsubscribe(), 8000, "The device could not refresh its reminder settings. Try again.");
            values = { ...values, friend: false, cup: false };
          }
        }
        if (!controller.signal.aborted) { setDevice({ manager, settings: values }); setLoadError(false); }
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [refresh, unsupported]);

  async function toggle(kind: Reminder) {
    if (!device || !settings?.publicKey || pending) return;
    const enabling = !settings[kind];
    setPending(true);
    setMessage("");
    try {
      if (enabling && Notification.permission === "denied") throw new Error(deniedMessage);
      // Both the worker and the key are ready before the tap. subscribe() can prompt directly.
      const subscription = enabling ? await withDeviceTimeout(
        device.manager.subscribe({ userVisibleOnly: true, applicationServerKey: pushKey(settings.publicKey) }),
        30000,
        "The device did not finish setting up reminders. If you see a permission prompt, answer it and try again.",
      ) : await deviceSubscription(device.manager);
      if (!subscription) {
        setDevice({ ...device, settings: { ...settings, friend: false, cup: false } });
        return;
      }
      const next = { ...settings, [kind]: enabling };
      const data = subscription.toJSON();
      if (!data?.endpoint || !data.keys?.p256dh || !data.keys.auth) throw new Error("The browser did not return a valid push subscription.");
      await callPlay<boolean>("play_push_save", {
        p_endpoint: data.endpoint, p_p256dh: data.keys.p256dh.replace(/=+$/, ""), p_auth: data.keys.auth.replace(/=+$/, ""),
        p_friend: next.friend, p_cup: next.cup,
      });
      setDevice({ ...device, settings: next });
      if (!next.friend && !next.cup) {
        await withDeviceTimeout(subscription.unsubscribe(), 8000, "").catch(() => false);
      }
    } catch (failure) {
      setMessage(failure instanceof DOMException && failure.name === "NotAllowedError" ? deniedMessage : playErrorMessage(failure));
    } finally { setPending(false); }
  }

  async function test() {
    if (!device || pending) return;
    setPending(true);
    setMessage("");
    try {
      const subscription = await deviceSubscription(device.manager);
      if (!subscription || !await callPlay<boolean>("play_push_test", { p_endpoint: subscription.endpoint })) {
        throw new Error("Turn on a reminder on this device first.");
      }
      setMessage("Test reminders queued. Close the reviewer now and check your notifications within a minute.");
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
        {(settings.friend || settings.cup) && <div className="play-reminder-test">
          <button className="btn small" disabled={pending} onClick={() => void test()}>Send test reminders</button>
          <small>Tests your enabled reminders after 30 seconds, even if you close the reviewer.</small>
        </div>}
      </>}
      {(message || pending) && <p role="status">{message || "Waiting for this device…"}</p>}
    </Card>
  </section>;
}
