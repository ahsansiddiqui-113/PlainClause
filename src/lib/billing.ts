import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, users, webhookEvents } from "@/db/schema";

// Billing provider: Polar (merchant of record; pays out to Pakistani bank accounts via Stripe Connect).
export type BillingInterval = "monthly" | "annual";

export const PRICES = {
  monthly: { amount: 8, label: "$8", per: "month" },
  annual: { amount: 59, label: "$59", per: "year" },
} as const;

/** Polar configuration. Checkout is disabled (503) until all of these are set. */
export function billingConfig() {
  const token = process.env.POLAR_ACCESS_TOKEN;
  const monthly = process.env.POLAR_PRODUCT_MONTHLY;
  const annual = process.env.POLAR_PRODUCT_ANNUAL;
  if (!token || !monthly || !annual) return null;
  const sandbox = (process.env.POLAR_SERVER ?? "sandbox") !== "production";
  return {
    token,
    products: { monthly, annual } as Record<BillingInterval, string>,
    apiBase: sandbox ? "https://sandbox-api.polar.sh/v1" : "https://api.polar.sh/v1",
  };
}

const TOLERANCE_SECONDS = 5 * 60;

/**
 * Verifies a Standard Webhooks signature (what Polar sends): headers `webhook-id`,
 * `webhook-timestamp`, `webhook-signature` ("v1,<base64 hmac>", space separated for key rotation).
 * Signed content is `${id}.${timestamp}.${rawBody}`. Secrets created before Sep 2026 used Polar's
 * legacy scheme (key = raw secret string), so both key forms are tried.
 */
export function verifyWebhook(
  rawBody: string,
  h: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  nowMs = Date.now(),
): boolean {
  if (!h.id || !h.timestamp || !h.signature || !secret) return false;
  const ts = Number(h.timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowMs / 1000 - ts) > TOLERANCE_SECONDS) return false; // replay guard
  const signed = `${h.id}.${h.timestamp}.${rawBody}`;
  const keys = [Buffer.from(secret.replace(/^whsec_/, ""), "base64"), Buffer.from(secret, "utf8")];
  const given = h.signature
    .split(" ")
    .map((p) => p.trim())
    .filter((p) => p.startsWith("v1,"))
    .map((p) => Buffer.from(p.slice(3), "base64"));
  for (const key of keys) {
    const expected = createHmac("sha256", key).update(signed, "utf8").digest();
    if (given.some((g) => g.length === expected.length && timingSafeEqual(g, expected))) return true;
  }
  return false;
}

/**
 * Does a subscription currently grant Pro?
 * - active / trialing: yes. past_due: yes (payment retries run; we don't cut access on one failed card).
 * - canceled: yes until the paid period ends (`endsAt`).
 * - everything else (unpaid, paused, incomplete, trial_ended...): no.
 */
export function isEntitled(status: string, endsAt: Date | null, now = new Date()): boolean {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
      return true;
    case "canceled":
      return !!endsAt && endsAt.getTime() > now.getTime();
    default:
      return false;
  }
}

type PolarSubscription = {
  id?: string;
  status?: string;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  ends_at?: string | null;
  modified_at?: string | null;
  recurring_interval?: string | null;
  product_id?: string | null;
  metadata?: { user_id?: unknown } | null;
  customer?: { external_id?: string | null } | null;
};
type PolarEvent = { type?: string; timestamp?: string; data?: PolarSubscription };

export type WebhookResult =
  | { ok: true; outcome: "processed" | "duplicate" | "ignored"; detail?: string }
  | { ok: false; status: number; error: string };

const HANDLED = new Set([
  "subscription.created",
  "subscription.active",
  "subscription.updated",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
  "subscription.cycled",
]);

function toDate(v: string | null | undefined) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Recompute users.plan from all of a user's subscriptions. */
export async function syncUserPlan(userId: string, now = new Date()) {
  const subs = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  const pro = subs.some((s) => isEntitled(s.status, s.endsAt, now));
  await db.update(users).set({ plan: pro ? "pro" : "free", updatedAt: now }).where(eq(users.id, userId));
  return pro;
}

/**
 * Applies a verified webhook. Idempotent: `eventId` is Polar's `webhook-id` header (identical on
 * retries), recorded only AFTER successful handling so a failed attempt is retried. Handlers are
 * upserts, so a concurrent duplicate is harmless.
 */
export async function handleBillingWebhook(rawBody: string, eventId: string): Promise<WebhookResult> {
  let event: PolarEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON" };
  }
  const eventName = event.type ?? "";
  if (!HANDLED.has(eventName)) return { ok: true, outcome: "ignored", detail: eventName };

  const [seen] = await db.select().from(webhookEvents).where(eq(webhookEvents.eventId, eventId)).limit(1);
  if (seen) return { ok: true, outcome: "duplicate" };

  const sub = event.data;
  const subId = sub?.id ? String(sub.id) : "";
  if (!sub || !subId || !sub.status) return { ok: false, status: 400, error: "Malformed subscription payload" };

  // Who owns it? customer.external_id (our user id, set at checkout), else metadata.user_id,
  // else a subscription we already know (an existing owner always wins over payload claims).
  let userId =
    sub.customer?.external_id ?? (typeof sub.metadata?.user_id === "string" ? sub.metadata.user_id : null);
  const [existing] = await db.select().from(subscriptions).where(eq(subscriptions.providerSubId, subId)).limit(1);
  if (existing) userId = existing.userId;
  if (!userId) return { ok: true, outcome: "ignored", detail: "no user" };
  const [owner] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!owner) return { ok: true, outcome: "ignored", detail: "unknown user" };

  const updatedAt = toDate(sub.modified_at) ?? toDate(event.timestamp);
  const stale = existing?.providerUpdatedAt && updatedAt && updatedAt < existing.providerUpdatedAt;
  if (!stale) {
    const periodEnd = toDate(sub.current_period_end);
    // Access end: an explicit ends_at, or the period end when cancellation is scheduled.
    const endsAt = toDate(sub.ends_at) ?? (sub.cancel_at_period_end ? periodEnd : null);
    const interval: BillingInterval | null =
      sub.recurring_interval === "year"
        ? "annual"
        : sub.recurring_interval === "month"
          ? "monthly"
          : sub.product_id && sub.product_id === process.env.POLAR_PRODUCT_ANNUAL
            ? "annual"
            : sub.product_id && sub.product_id === process.env.POLAR_PRODUCT_MONTHLY
              ? "monthly"
              : ((existing?.interval as BillingInterval | null) ?? null);
    const row = {
      userId,
      status: sub.status,
      currentPeriodEnd: periodEnd,
      endsAt,
      interval,
      providerUpdatedAt: updatedAt ?? existing?.providerUpdatedAt ?? null,
    };
    await db
      .insert(subscriptions)
      .values({ providerSubId: subId, ...row })
      .onConflictDoUpdate({ target: subscriptions.providerSubId, set: row });
    await syncUserPlan(userId);
  }

  await db.insert(webhookEvents).values({ eventId, eventName }).onConflictDoNothing();
  return { ok: true, outcome: stale ? "ignored" : "processed", detail: stale ? "stale" : undefined };
}
