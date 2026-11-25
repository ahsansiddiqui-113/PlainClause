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
  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          test_mode: cfg.testMode,
          // user_id round-trips to the webhook as meta.custom_data.user_id
          checkout_data: { email: user.email, custom: { user_id: user.id } },
          product_options: { redirect_url: `${site}/dashboard?upgraded=1` },
        },
        relationships: {
          store: { data: { type: "stores", id: cfg.storeId } },
          variant: { data: { type: "variants", id: cfg.variants[parsed.data.plan] } },
        },
      },
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    if (res) console.error("lemonsqueezy checkout failed", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
  const json = (await res.json()) as { data?: { attributes?: { url?: string } } };
  const url = json.data?.attributes?.url;
  if (!url) return NextResponse.json({ error: "Couldn't start checkout." }, { status: 502 });
  return NextResponse.json({ url });
}
