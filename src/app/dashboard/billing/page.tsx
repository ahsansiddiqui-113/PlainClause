import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

async function BillingContent({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const portalUnavailable = (await searchParams).portal === "unavailable";
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/billing");

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.providerUpdatedAt))
    .limit(1);

  const isPro = user.plan === "pro";
  // Cancelled-but-paid: Polar keeps status active (or canceled) with an end date until the period runs out.
  const cancelled = isPro && !!sub?.endsAt; // an end date on a still-Pro subscription means it was cancelled
  const pastDue = sub?.status === "past_due";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Billing</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">Your plan and subscription.</p>
      </header>

      <div className="max-w-2xl rounded-3xl border bg-card p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current plan</p>
        <p className="mt-1 text-4xl font-extrabold">{isPro ? "Pro" : "Free"}</p>

        {isPro && sub && (
          <dl className="mt-6 space-y-2 text-lg">
            {sub.interval && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Billing</dt>
                <dd className="font-medium">{sub.interval === "annual" ? "$59 / year" : "$8 / month"}</dd>
              </div>
            )}
            {cancelled ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Pro access ends</dt>
                <dd className="font-medium">{fmt(sub.endsAt)}</dd>
              </div>
            ) : (
              fmt(sub.currentPeriodEnd) && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Next renewal</dt>
                  <dd className="font-medium">{fmt(sub.currentPeriodEnd)}</dd>
                </div>
              )
            )}
          </dl>
        )}

        {pastDue && (
          <p role="alert" className="mt-5 rounded-lg bg-destructive/10 p-4 text-base text-destructive">
            Your last payment failed. Please update your payment method to keep Pro.
          </p>
        )}
        {cancelled && (
          <p className="mt-5 text-base text-muted-foreground">
            Your subscription is cancelled and won&apos;t renew. You can resume it from the billing portal before it
            ends.
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {isPro && sub ? (
            // Plain anchor: this route mints a short-lived portal link and redirects off-site.
            <a href="/api/billing/portal" className={buttonClass({ size: "lg" })}>
              Manage subscription
            </a>
          ) : null}
          {!isPro && (
            <Link href="/pricing" className={buttonClass({ size: "lg" })}>
              Upgrade to Pro
            </Link>
          )}
        </div>
        {portalUnavailable && (
          <p role="alert" className="mt-4 text-base text-destructive">
            The billing portal isn&apos;t available right now. Please try again, or use the link in your receipt email.
          </p>
        )}
      </div>
    </div>
  );
}

export default function BillingPage({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  return (
    <main className="mx-auto w-full max-w-[96rem] px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
      <Suspense fallback={<div className="h-72 max-w-2xl animate-pulse rounded-3xl bg-muted/60" aria-hidden />}>
        <BillingContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
