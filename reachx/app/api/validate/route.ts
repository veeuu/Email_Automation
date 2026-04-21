import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";

// Allow up to 60s for Apify polling on Vercel/Railway
export const maxDuration = 60;

type ApifyResult = {
  email: string;
  result: string;
  resultcode: number;
  quality: string;
  free: boolean;
  role: boolean;
  didyoumean: string;
  error: string;
};

async function verifyWithApify(emails: string[]) {
  const token = process.env.APIFY_API_TOKEN!;

  // Start the actor run
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/account56~email-verifier/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    }
  );

  const runData = await runRes.json();
  const runId = runData?.data?.id;
  if (!runId) throw new Error("Failed to start Apify actor");

  // Poll until finished
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));

    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
    );
    const statusData = await statusRes.json();
    const status = statusData?.data?.status;

    if (status === "SUCCEEDED") {
      const datasetId = statusData.data.defaultDatasetId;
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`
      );
      const items = await itemsRes.json();
      console.log("Apify raw response:", JSON.stringify(items, null, 2));
      return items as ApifyResult[];
    }

    if (status === "FAILED" || status === "ABORTED") {
      throw new Error("Apify actor run failed");
    }
  }

  throw new Error("Apify actor timed out");
}

function mapApifyResult(r: ApifyResult) {
  // resultcode 1 = valid, 2 = catch-all, 3+ = invalid/unknown
  if (r.result === "ok" || r.resultcode === 1) {
    const reason = r.free
      ? "Valid free email provider"
      : r.role
      ? "Valid but role-based address"
      : "Mailbox verified";
    return { email: r.email, status: "VALID", reason };
  }

  if (r.resultcode === 2 || r.result === "catch_all") {
    return { email: r.email, status: "RISKY", reason: "Catch-all domain (cannot verify mailbox)" };
  }

  if (r.result === "invalid" || r.resultcode >= 3) {
    return { email: r.email, status: "INVALID", reason: r.error || "Mailbox does not exist" };
  }

  return { email: r.email, status: "RISKY", reason: "Could not verify" };
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "guerrillamail.info", "spam4.me", "trashmail.com", "dispostable.com",
]);

async function fastValidate(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { email, status: "INVALID", reason: "Invalid email format" };
  }

  const domain = email.split("@")[1].toLowerCase();

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { email, status: "INVALID", reason: "Disposable email provider" };
  }

  try {
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) {
      return { email, status: "INVALID", reason: "No MX records found for domain" };
    }
    return { email, status: "RISKY", reason: "Format and MX valid (deep check unavailable)" };
  } catch {
    return { email, status: "INVALID", reason: "Domain does not exist or has no mail server" };
  }
}

// POST /api/validate
export async function POST(req: NextRequest) {
  const { emails } = await req.json();

  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: "Provide an array of emails" }, { status: 400 });
  }

  try {
    const apifyResults = await verifyWithApify(emails);
    const results = apifyResults.map(mapApifyResult);
    return NextResponse.json({ results });
  } catch (err) {
    console.warn("Apify failed, falling back to fast validation:", err);
    // Fallback: run lightweight format + MX check
    const results = await Promise.all(emails.map(fastValidate));
    return NextResponse.json({ results });
  }
}
