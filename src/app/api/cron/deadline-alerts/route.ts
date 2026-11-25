import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runDeadlineAlerts } from "@/lib/alerts";
import { emailConfigured } from "@/lib/email";

export const maxDuration = 60;

function authorized(header: string | null, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  if (!authorized(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Don't claim alerts we can't deliver.
  if (!emailConfigured()) return NextResponse.json({ error: "Email not configured" }, { status: 503 });

  try {
    const run = await runDeadlineAlerts();
    return NextResponse.json(run);
  } catch (e) {
    console.error("deadline alerts failed", e);
    return NextResponse.json({ error: "Run failed" }, { status: 500 });
  }
}
