/**
 * Self-hosted scheduler — runs inside the Next.js process.
 * Calls the cron endpoint every 60 seconds to process scheduled campaigns.
 * Only runs in production (Railway) or when ENABLE_SCHEDULER=true locally.
 */

let started = false;

export function startScheduler() {
  if (started) return;
  if (process.env.NODE_ENV !== "production" && process.env.ENABLE_SCHEDULER !== "true") return;

  started = true;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const secret = process.env.CRON_SECRET ?? "";

  console.log("[scheduler] Starting — will check for scheduled campaigns every 60s");

  setInterval(async () => {
    try {
      const res = await fetch(`${appUrl}/api/cron/send-scheduled`, {
        method: "POST",
        headers: { "x-cron-secret": secret },
      });
      const data = await res.json();
      if (data.processed > 0) {
        console.log(`[scheduler] Processed ${data.processed} campaign(s)`);
      }
    } catch (err) {
      console.error("[scheduler] Error calling cron:", err);
    }
  }, 60_000);
}
