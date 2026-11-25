import type { Metadata } from "next";
import { JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { Suspense } from "react";
import { DepositChecker } from "@/components/tools/deposit-checker";

export const metadata: Metadata = {
  title: "Security Deposit Deduction Checker",
  description:
    "Add up your landlord's itemized deductions and see how much of your security deposit you should get back. Free, shareable link.",
  alternates: { canonical: "/tools/deposit-deduction-checker" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <JsonLd data={softwareJsonLd({ name: "Security Deposit Deduction Checker", description: String(metadata.description), url: absoluteUrl("/tools/deposit-deduction-checker") })} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Security Deposit Deduction Checker</h1>
        <p className="text-muted-foreground">
          Enter your deposit and each deduction your landlord listed to see your refund. Your inputs
          are saved in the page link so you can share it.
        </p>
      </header>
      <Suspense>
        <DepositChecker />
      </Suspense>
      <p className="text-xs text-muted-foreground">
        This tool only does arithmetic; it cannot tell you whether a deduction is legal. Normal wear
        and tear is generally not deductible, but rules vary by location. Informational tool, not
        legal advice.
      </p>
    </main>
  );
}
