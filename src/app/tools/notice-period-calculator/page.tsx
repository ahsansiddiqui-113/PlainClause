import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { NoticeCalculator } from "@/components/tools/notice-calculator";
import { RelatedTools, SideCard, ToolShell } from "@/components/site/tool-shell";

export const metadata: Metadata = {
  title: "Lease Notice Period Calculator",
  description:
    "Find the last day to give notice before your lease ends or auto-renews, and calculate prorated first-month rent. Free, shareable link.",
  alternates: { canonical: "/tools/notice-period-calculator" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={softwareJsonLd({
          name: "Lease Notice Period Calculator",
          description: String(metadata.description),
          url: absoluteUrl("/tools/notice-period-calculator"),
        })}
      />
      <ToolShell
        eyebrow="Free calculator · No AI"
        title="Lease Notice Period Calculator"
        intro="Missing a notice deadline can lock you into another lease term. Enter your lease end date and notice period to see your deadline. Your inputs are saved in the page link so you can share it."
        aside={
          <>
            <SideCard title="Good to know" tone="accent">
              <p>Some leases count notice from the next rent due date instead of the end date. Check your lease.</p>
              <p>Written notice often must be delivered in a specific way. Email may not count.</p>
              <p>Add a calendar reminder a few days before your deadline.</p>
            </SideCard>
            <RelatedTools exclude="/tools/notice-period-calculator" />
          </>
        }
      >
        <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-muted/60" aria-hidden />}>
          <NoticeCalculator />
        </Suspense>
        <p className="text-sm text-muted-foreground">
          Estimates only. Some leases and local laws count notice differently. Informational tool, not legal advice.
        </p>
      </ToolShell>
    </>
  );
}
