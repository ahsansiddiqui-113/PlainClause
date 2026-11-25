import { NextResponse } from "next/server";
import { z } from "zod";
import { billingConfig } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";

const body = z.object({ plan: z.enum(["monthly", "annual"]) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (user.plan === "pro") {
    return NextResponse.json({ error: "You already have Pro.", code: "already_pro" }, { status: 409 });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a plan." }, { status: 400 });

  const cfg = billingConfig();
  if (!cfg) {
    return NextResponse.json({ error: "Checkout isn't available yet. Please try again soon." }, { status: 503 });
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const create = (withEmail: boolean) =>
    fetch(`${cfg.apiBase}/checkouts/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        products: [cfg.products[parsed.data.plan]],
        // Becomes customer.external_id in every subscription webhook: how we map payments to users.
        external_customer_id: user.id,
        ...(withEmail ? { customer_email: user.email } : {}),
        metadata: { user_id: user.id },
        success_url: `${site}/dashboard?upgraded=1`,
      }),
    }).catch(() => null);

  let res = await create(true);
  if (res?.status === 422) {
    // Polar validates email deliverability; if it rejects ours, let the checkout page ask for one.
    const detail = await res.text().catch(() => "");
    if (detail.includes("customer_email")) res = await create(false);
    else console.error("polar checkout failed 422", detail);
  }

  if (!res || !res.ok) {
    if (res && res.status !== 422) console.error("polar checkout failed", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
  const json = (await res.json()) as { url?: string };
  if (!json.url) return NextResponse.json({ error: "Couldn't start checkout." }, { status: 502 });
  return NextResponse.json({ url: json.url });
}
