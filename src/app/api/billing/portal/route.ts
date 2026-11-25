import { NextResponse } from "next/server";
import { billingConfig } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";

// Portal links are short-lived, so one is minted per click instead of stored.
export async function GET() {
  const user = await getCurrentUser();
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  if (!user) return NextResponse.redirect(`${site}/login?next=/dashboard/billing`);

  const cfg = billingConfig();
  if (!cfg) return NextResponse.redirect(`${site}/dashboard/billing?portal=unavailable`);

  const res = await fetch(`${cfg.apiBase}/customer-sessions/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ external_customer_id: user.id, return_url: `${site}/dashboard/billing` }),
  }).catch(() => null);

  const json = res?.ok ? ((await res.json()) as { customer_portal_url?: string }) : null;
  if (!json?.customer_portal_url) return NextResponse.redirect(`${site}/dashboard/billing?portal=unavailable`);
  return NextResponse.redirect(json.customer_portal_url);
}
