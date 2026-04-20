import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 500 }
    );
  }
}
