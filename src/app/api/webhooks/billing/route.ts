import { NextResponse } from "next/server";
import { handleBillingWebhook, verifyWebhook } from "@/lib/billing";

export const maxDuration = 30;

// Polar webhook endpoint (Standard Webhooks). Polar expects a 2xx within ~10s; 3xx counts as failure.
export async function POST(req: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  // The signature covers the exact raw bytes, so read text, not JSON.
  const raw = await req.text();
  const id = req.headers.get("webhook-id");
  const ok = verifyWebhook(
    raw,
    { id, timestamp: req.headers.get("webhook-timestamp"), signature: req.headers.get("webhook-signature") },
    secret,
  );
  if (!ok || !id) return NextResponse.json({ error: "Invalid signature" }, { status: 403 });

  try {
    const result = await handleBillingWebhook(raw, id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ received: true, outcome: result.outcome }, { status: 202 });
  } catch (e) {
    console.error("billing webhook failed", e);
    // 500 makes Polar retry; the event is only recorded once handled.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
