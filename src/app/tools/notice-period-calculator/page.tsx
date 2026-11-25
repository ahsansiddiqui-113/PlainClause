import type { Metadata } from "next";
import { JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { Suspense } from "react";
import { NoticeCalculator } from "@/components/tools/notice-calculator";

export const metadata: Metadata = {
  title: "Lease Notice Period Calculator",
  description:
    "Find the last day to give notice before your lease ends or auto-renews, and calculate prorated first-month rent. Free, shareable link.",
  alternates: { canonical: "/tools/notice-period-calculator" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <JsonLd data={softwareJsonLd({ name: "Lease Notice Period Calculator", description: String(metadata.description), url: absoluteUrl("/tools/notice-period-calculator") })} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Lease Notice Period Calculator</h1>
        <p className="text-muted-foreground">
          Missing a notice deadline can lock you into another lease term. Enter your lease end date
          and notice period to see your deadline. Your inputs are saved in the page link so you can
          share it.
        </p>
      </header>
      <Suspense>
        <NoticeCalculator />
      </Suspense>
      <p className="text-xs text-muted-foreground">
        Estimates only. Some leases and local laws count notice differently (for example, from the
        next rent due date). Check your lease. Informational tool, not legal advice.
      </p>
    </main>
  );
}
