import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/track?rid=<recipientId>&cid=<campaignId>&type=open|click&url=<url>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recipientId = searchParams.get("rid");
  const campaignId = searchParams.get("cid");
  const type = searchParams.get("type"); // "open" | "click"
  const url = searchParams.get("url");

  if (recipientId && campaignId) {
    await prisma.emailEvent.create({
      data: {
        eventType: type === "click" ? "CLICKED" : "OPENED",
        campaignId,
        recipientId,
        metadata: url ? { url } : undefined,
      },
    });
  }

  if (type === "click" && url) {
    return NextResponse.redirect(url);
  }

  // Return 1x1 transparent pixel for open tracking
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  return new NextResponse(pixel, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
  });
}
