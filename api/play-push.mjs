import { createECDH, createHash, createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

export function playVapidDetails(token) {
  const curve = createECDH("prime256v1");
  // Domain separation keeps the VAPID key distinct from the database worker token.
  for (let attempt = 0; attempt < 8; attempt++) {
    const scalar = createHmac("sha256", Buffer.from(token, "hex"))
      .update(`nlereviewer:web-push:v1:${attempt}`).digest();
    try { curve.setPrivateKey(scalar); } catch { continue; }
    return {
      subject: "https://nlereviewer.vercel.app",
      publicKey: curve.getPublicKey().toString("base64url"),
      privateKey: scalar.toString("base64url"),
    };
  }
  throw new Error("Unable to derive the push signing key.");
}

export function isWebPushProvider(endpoint) {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && !url.hash && url.pathname !== "/"
      && /^(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)$/.test(url.hostname);
  } catch {
    return false;
  }
}

export function pushMessage(job) {
  const tag = createHash("sha256").update(job.event).digest("base64url").slice(0, 24);
  if (job.kind === "cup") return { title: "Nightly Cup lobby is open", body: "Join before 9:00 PM Philippine time.", path: "/play/cup", tag };
  if (job.kind === "friend") return { title: "Live Match invitation", body: "A friend invited you to play. Open NLEReviewer to join.", path: `/play?invite=${job.invite}`, tag };
  return { title: "NLEReviewer reminders are on", body: "This device can receive Play notifications.", path: "/play", tag };
}

async function deliver(job, vapidDetails) {
  const result = { id: job.id, lease: job.lease, status: "failed" };
  if (!isWebPushProvider(job.endpoint)) return result;
  try {
    const message = pushMessage(job);
    await webPush.sendNotification({ endpoint: job.endpoint, keys: { p256dh: job.p256dh, auth: job.auth } }, JSON.stringify(message), {
      vapidDetails, TTL: Math.min(job.ttl, 900), timeout: 5000, topic: message.tag, urgency: "high",
    });
    result.status = "sent";
  } catch (error) {
    const code = error?.statusCode;
    if (code === 404 || code === 410) result.status = "gone";
    else if (!code || code === 429 || code >= 500) result.status = "retry";
  }
  return result;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") return response.status(405).json({ error: "Use POST." });
  const token = request.headers["x-nle-push-worker"];
  if (typeof token !== "string" || !/^[0-9a-f]{64}$/.test(token)) return response.status(401).json({ error: "Worker access denied." });
  const databaseUrl = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!databaseUrl || !publishableKey) return response.status(503).json({ error: "Push is not configured." });

  try {
    const database = createClient(databaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const vapidDetails = playVapidDetails(token);
    const { data: jobs, error } = await database.rpc("play_push_take", { p_token: token, p_public_key: vapidDetails.publicKey })
      .abortSignal(AbortSignal.timeout(6000));
    if (error?.code === "42501") return response.status(401).json({ error: "Worker access denied." });
    if (error || !Array.isArray(jobs)) return response.status(503).json({ error: "Could not claim reminders." });

    const results = await Promise.all(jobs.map(job => deliver(job, vapidDetails)));
    if (results.length) {
      const receipt = await database.rpc("play_push_finish", { p_token: token, p_results: results }).abortSignal(AbortSignal.timeout(6000));
      if (receipt.error) return response.status(503).json({ error: "Could not record reminder delivery." });
    }
    return response.status(200).json({ claimed: results.length, sent: results.filter(result => result.status === "sent").length });
  } catch {
    return response.status(503).json({ error: "Push worker is unavailable." });
  }
}
