self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

function playPath(value) {
  if (value === "/play/cup" || /^\/play\?invite=[0-9a-f-]{36}$/i.test(value ?? "")) return value;
  return "/play";
}

self.addEventListener("push", event => {
  let message = {};
  try { message = event.data?.json() ?? {}; } catch { /* Use the default message. */ }
  event.waitUntil(self.registration.showNotification(message.title || "NLEReviewer Play", {
    body: message.body || "Open Play to see what is new.",
    icon: "/play-icon-192.png",
    tag: message.tag || "nle-play",
    data: { path: playPath(message.path) },
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const destination = new URL(playPath(event.notification.data?.path), self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const open = windows.find(client => client.url === destination);
    if (open) await open.focus();
    else await self.clients.openWindow(destination);
  })());
});
