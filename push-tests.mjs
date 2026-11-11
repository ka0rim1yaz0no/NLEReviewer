import assert from "node:assert/strict";
import { createECDH, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import webPush from "web-push";
import handler, { isWebPushProvider, playVapidDetails, pushMessage } from "./api/play-push.mjs";

test("the worker produces a stable VAPID key and encrypted Web Push requests", () => {
  const token = "e1".repeat(32);
  const vapidDetails = playVapidDetails(token);
  assert.deepEqual(playVapidDetails(token), vapidDetails);
  assert.notEqual(playVapidDetails("e2".repeat(32)).publicKey, vapidDetails.publicKey);
  assert.equal(Buffer.from(vapidDetails.publicKey, "base64url").length, 65);
  assert.equal(Buffer.from(vapidDetails.privateKey, "base64url").length, 32);
  const browserKey = createECDH("prime256v1").generateKeys().toString("base64url");
  const endpoint = "https://web.push.apple.com/test-device";
  const message = pushMessage({ kind: "cup", event: "cup:2026-11-12" });
  const request = webPush.generateRequestDetails({ endpoint, keys: { p256dh: browserKey, auth: randomBytes(16).toString("base64url") } }, JSON.stringify(message), {
    vapidDetails, TTL: 900, topic: message.tag,
  });
  assert.equal(request.headers["Content-Encoding"], "aes128gcm");
  assert.ok(request.headers.Authorization.startsWith("vapid t="));
  assert.ok(request.headers.Authorization.endsWith(`k=${vapidDetails.publicKey}`));
  assert.ok(!request.body.includes("Nightly Cup"));
});

test("device deliveries are restricted to recognized HTTPS push providers", () => {
  assert.ok(isWebPushProvider("https://fcm.googleapis.com/fcm/send/device"));
  assert.ok(isWebPushProvider("https://updates.push.services.mozilla.com/wpush/v2/device"));
  assert.ok(isWebPushProvider("https://web.push.apple.com/device"));
  assert.ok(isWebPushProvider("https://wns2.notify.windows.com/w/?token=example"));
  for (const endpoint of ["https://web.push.apple.com.example.com/device", "http://fcm.googleapis.com/device", "https://fcm.googleapis.com@other.invalid/device", "https://web.push.apple.com:444/device", "https://web.push.apple.com/#fragment"]) {
    assert.equal(isWebPushProvider(endpoint), false, endpoint);
  }
});

test("the hosted worker rejects requests without a valid worker credential shape", async () => {
  const response = { setHeader() {}, status(code) { this.code = code; return this; }, json() {} };
  await handler({ method: "GET", headers: {} }, response);
  assert.equal(response.code, 405);
  await handler({ method: "POST", headers: {} }, response);
  assert.equal(response.code, 401);
  await handler({ method: "POST", headers: { "x-nle-push-worker": "bad-key" } }, response);
  assert.equal(response.code, 401);
});

test("the service worker shows friend and Cup notifications and opens safe app routes", async () => {
  const handlers = new Map(), shown = [], destinations = [];
  const origin = "https://nlereviewer.vercel.app";
  const self = {
    location: { origin },
    addEventListener(name, handle) { handlers.set(name, handle); },
    registration: { showNotification: async (title, options) => shown.push({ title, options }) },
    clients: { matchAll: async () => [], openWindow: async url => destinations.push(url) },
  };
  vm.runInNewContext(await readFile(new URL("./public/play-push-sw.js", import.meta.url), "utf8"), { self, URL });
  const invite = "15000000-0000-0000-0000-000000000001";
  const friendMessage = pushMessage({ kind: "friend", invite, event: "friend:" + invite });
  const cupMessage = pushMessage({ kind: "cup", event: "cup:2026-11-12" });
  for (const message of [friendMessage, cupMessage, { path: "https://other.invalid/" }]) {
    await new Promise(resolve => handlers.get("push")({ data: { json: () => message }, waitUntil: task => task.then(resolve) }));
    const current = shown.at(-1);
    await new Promise(resolve => handlers.get("notificationclick")({ notification: { data: current.options.data, close() {} }, waitUntil: task => task.then(resolve) }));
  }
  assert.deepEqual(destinations, [`${origin}/play?invite=${invite}`, `${origin}/play/cup`, `${origin}/play`]);
  assert.match(shown[0].options.body, /^A friend invited you/);
  assert.match(shown[1].title, /Nightly Cup/);
});
