import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Wrap } from "@/components/site/wrap";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Scan one contract free. Go Pro for full-document scans, a saved vault, deadline reminders and exports.",
  alternates: { canonical: "/pricing" },
};

const freeFeatures = [
  "Unlimited clause scans (3 per day)",
  "1 full-document scan, first 3 pages",
  "Free guides and calculators",
];
const proFeatures = [
  "Full documents up to 25 pages",
  "Vault: every contract saved and searchable",
  "Deadline reminders before notice windows close",
  "Word-for-word negotiation emails",
  "PDF and CSV exports",
  "All premium negotiation playbooks",
];

async function Ctas({ interval }: { interval: "monthly" | "annual" | "free" }) {
  const user = await getCurrentUser();
  if (interval === "free") {
    return (
      <Link href={user ? "/dashboard" : "/login?mode=signup"} className={`${buttonClass({ size: "lg", variant: "outline" })} w-full`}>
        {user ? "Go to dashboard" : "Start free"}
      </Link>
    );
  }
  return (
    <CheckoutButton
      plan={interval}
      signedIn={!!user}
      alreadyPro={user?.plan === "pro"}
      featured={interval === "annual"}
      label={interval === "annual" ? "Get Pro, yearly" : "Get Pro, monthly"}
    />
  );
}

function Cta({ interval }: { interval: "monthly" | "annual" | "free" }) {
  return (
    <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-lg bg-muted" aria-hidden />}>
      <Ctas interval={interval} />
    </Suspense>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-lg">
      {items.map((f) => (
        <li key={f} className="flex gap-3">
          <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
          {f}
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <main>
      <section className="bg-grid border-b">
        <Wrap className="py-16 text-center lg:py-24">
          <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-6xl">Simple pricing, no surprises</h1>
          <p className="mx-auto mt-5 max-w-2xl text-xl text-muted-foreground">
            Try it free. Upgrade when you need full documents, a vault and reminders. Cancel any time.
          </p>
        </Wrap>
      </section>

      <Wrap className="py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col rounded-3xl border bg-card p-8">
            <h2 className="text-2xl font-bold">Free</h2>
            <p className="mt-3 text-5xl font-extrabold">$0</p>
            <p className="text-muted-foreground">forever</p>
            <div className="flex-1">
              <List items={freeFeatures} />
            </div>
            <div className="mt-8">
              <Cta interval="free" />
            </div>
          </div>

          <div className="flex flex-col rounded-3xl border bg-card p-8">
            <h2 className="text-2xl font-bold">Pro Monthly</h2>
            <p className="mt-3 text-5xl font-extrabold">
              $8<span className="text-xl font-medium text-muted-foreground"> / month</span>
            </p>
            <p className="text-muted-foreground">billed monthly</p>
            <div className="flex-1">
              <List items={proFeatures} />
            </div>
            <div className="mt-8">
              <Cta interval="monthly" />
            </div>
          </div>

          <div className="relative flex flex-col rounded-3xl border-2 border-primary bg-card p-8 shadow-lg">
            <span className="absolute -top-3.5 left-8 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
              Best value, save 38%
            </span>
            <h2 className="text-2xl font-bold">Pro Annual</h2>
            <p className="mt-3 text-5xl font-extrabold">
              $59<span className="text-xl font-medium text-muted-foreground"> / year</span>
            </p>
            <p className="text-muted-foreground">about $4.92 a month</p>
            <div className="flex-1">
              <List items={proFeatures} />
            </div>
            <div className="mt-8">
              <Cta interval="annual" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-6 text-lg text-muted-foreground">
          <p>
            Payments are handled by our payment provider, which acts as merchant of record and handles sales tax and
            VAT. We never see your card number. Subscriptions renew until cancelled; cancel from your billing page and
            keep Pro until the end of the period you paid for.
          </p>
          <p>
            PlainClause provides general information, not legal advice. See our{" "}
            <Link href="/legal/terms" className="font-medium text-foreground underline underline-offset-4">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/refund-policy" className="font-medium text-foreground underline underline-offset-4">
              refund policy
            </Link>
            .
          </p>
        </div>
      </Wrap>
    </main>
  );
}
