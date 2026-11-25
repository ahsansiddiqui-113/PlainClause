import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, users, webhookEvents } from "@/db/schema";

export type BillingInterval = "monthly" | "annual";

export const PRICES = {
  monthly: { amount: 8, label: "$8", per: "month" },
  annual: { amount: 59, label: "$59", per: "year" },
} as const;

/** Lemon Squeezy configuration. Checkout is disabled (503) until all of these are set. */
export function billingConfig() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const monthly = process.env.LEMONSQUEEZY_VARIANT_MONTHLY;
  const annual = process.env.LEMONSQUEEZY_VARIANT_ANNUAL;
  if (!apiKey || !storeId || !monthly || !annual) return null;
  return {
    apiKey,
    storeId,
    variants: { monthly, annual } as Record<BillingInterval, string>,
    testMode: process.env.LEMONSQUEEZY_TEST_MODE === "true",
  };
}

/** Constant-time check of Lemon Squeezy's `X-Signature` (hex HMAC-SHA256 of the raw body). */
export function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let given: Buffer;
  try {
    given = Buffer.from(signature.trim(), "hex");
  } catch {
    return false;
  }
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Does a subscription currently grant Pro?
 * - active / trialing: yes. past_due: yes (payment retries run; we don't cut access on one failed card).
 * - cancelled: yes until the paid period ends (`endsAt`).
 * - paused / unpaid / expired: no.
 */
export function isEntitled(status: string, endsAt: Date | null, now = new Date()): boolean {
  switch (status) {
    case "active":
    case "on_trial":
    case "past_due":
      return true;
    case "cancelled":
      return !!endsAt && endsAt.getTime() > now.getTime();
    default:
      return false;
  }
}

type LsPayload = {
  meta?: { event_name?: string; custom_data?: { user_id?: unknown } };
  data?: {
    id?: string | number;
    type?: string;
    attributes?: {
      status?: string;
      renews_at?: string | null;
      ends_at?: string | null;
      updated_at?: string | null;
      variant_id?: number | string;
      urls?: { customer_portal?: string | null };
    };
  };
};

export type WebhookResult =
  | { ok: true; outcome: "processed" | "duplicate" | "ignored"; detail?: string }
  | { ok: false; status: number; error: string };

const HANDLED = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
  "subscription_payment_failed",
  "subscription_payment_success",
  "subscription_payment_recovered",
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
 * Applies a verified webhook body. Idempotent: the event id is a hash of the raw body
 * (providers redeliver identical bytes on retry), recorded only AFTER successful handling so a
 * failed attempt is retried. Handlers are upserts, so a concurrent duplicate is harmless.
 */
export async function handleBillingWebhook(rawBody: string): Promise<WebhookResult> {
  let payload: LsPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON" };
  }
  const eventName = payload.meta?.event_name ?? "";
  const eventId = createHash("sha256").update(rawBody).digest("hex");

  if (!HANDLED.has(eventName)) return { ok: true, outcome: "ignored", detail: eventName };

  const [seen] = await db.select().from(webhookEvents).where(eq(webhookEvents.eventId, eventId)).limit(1);
  if (seen) return { ok: true, outcome: "duplicate" };

  const attrs = payload.data?.attributes;
  const subId = payload.data?.id != null ? String(payload.data.id) : "";
  if (payload.data?.type !== "subscriptions" || !subId || !attrs?.status) {
    return { ok: false, status: 400, error: "Malformed subscription payload" };
  }

  // Who owns it? custom_data.user_id (set at checkout), else a subscription we already know.
  let userId = typeof payload.meta?.custom_data?.user_id === "string" ? payload.meta.custom_data.user_id : null;
  const [existing] = await db.select().from(subscriptions).where(eq(subscriptions.providerSubId, subId)).limit(1);
  if (existing) userId = existing.userId;
  if (!userId) return { ok: true, outcome: "ignored", detail: "no user" };
  const [owner] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!owner) return { ok: true, outcome: "ignored", detail: "unknown user" };

  const updatedAt = toDate(attrs.updated_at);
  const stale = existing?.providerUpdatedAt && updatedAt && updatedAt < existing.providerUpdatedAt;
  if (!stale) {
    const variant = String(attrs.variant_id ?? "");
    const interval: BillingInterval | null =
      variant && variant === process.env.LEMONSQUEEZY_VARIANT_ANNUAL
        ? "annual"
        : variant && variant === process.env.LEMONSQUEEZY_VARIANT_MONTHLY
          ? "monthly"
          : (existing?.interval as BillingInterval | null) ?? null;
    const row = {
      userId,
      status: attrs.status,
      currentPeriodEnd: toDate(attrs.renews_at) ?? toDate(attrs.ends_at),
      endsAt: toDate(attrs.ends_at),
      interval,
      portalUrl: attrs.urls?.customer_portal ?? existing?.portalUrl ?? null,
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
