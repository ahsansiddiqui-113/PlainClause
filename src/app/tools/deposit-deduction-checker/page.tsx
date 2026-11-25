import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { DepositChecker } from "@/components/tools/deposit-checker";
import { RelatedTools, SideCard, ToolShell } from "@/components/site/tool-shell";

export const metadata: Metadata = {
  title: "Security Deposit Deduction Checker",
  description:
    "Add up your landlord's itemized deductions and see how much of your security deposit you should get back. Free, shareable link.",
  alternates: { canonical: "/tools/deposit-deduction-checker" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={softwareJsonLd({
          name: "Security Deposit Deduction Checker",
          description: String(metadata.description),
          url: absoluteUrl("/tools/deposit-deduction-checker"),
        })}
      />
      <ToolShell
        eyebrow="Free calculator · No AI"
        title="Security Deposit Deduction Checker"
        intro="Enter your deposit and each deduction your landlord listed to see your refund. Your inputs are saved in the page link so you can share it."
        aside={
          <>
            <SideCard title="Good to know" tone="accent">
              <p>Normal wear and tear is generally not deductible, but rules vary by location.</p>
              <p>Ask for receipts or estimates for every deduction you disagree with.</p>
              <p>This tool only adds numbers. It can&apos;t tell you whether a charge is legal.</p>
            </SideCard>
            <RelatedTools exclude="/tools/deposit-deduction-checker" />
          </>
        }
      >
        <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-muted/60" aria-hidden />}>
          <DepositChecker />
        </Suspense>
        <p className="text-sm text-muted-foreground">Informational tool, not legal advice.</p>
      </ToolShell>
    </>
  );
}
