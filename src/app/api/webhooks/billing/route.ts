import { NextResponse } from "next/server";
import { handleBillingWebhook, verifySignature } from "@/lib/billing";

export const maxDuration = 30;

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  // Signature is computed over the exact raw bytes, so read text, not JSON.
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const result = await handleBillingWebhook(raw);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ received: true, outcome: result.outcome });
  } catch (e) {
    console.error("billing webhook failed", e);
    // 500 makes the provider retry; the event is only recorded once handled.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
