import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FileDown, FileSpreadsheet, FileText, Lock } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { listDocuments } from "@/lib/vault";

export const metadata: Metadata = {
  title: "Exports",
  robots: { index: false, follow: false },
};

async function ExportsContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/exports");
  const isPro = user.plan === "pro";
  const count = isPro ? (await listDocuments(user.id)).length : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Exports</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
          Download a clean summary of every saved contract: risk level, key dates, obligations and red flags.
        </p>
      </header>

      {!isPro ? (
        <div className="relative isolate overflow-hidden rounded-3xl border bg-accent/50 p-10 text-center">
          <Lock className="mx-auto size-10 text-primary" aria-hidden />
          <h2 className="mt-4 text-3xl font-bold">Exports are a Pro feature</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
            Pro members can export all contract obligations as a PDF report or a CSV for spreadsheets, and get
            deadline reminders by email.
          </p>
          <Link href="/pricing" className={`${buttonClass({ size: "lg" })} mt-6`}>
            Upgrade to Pro
          </Link>
        </div>
      ) : (
        <>
          <p className="text-lg">
            {count} saved document{count === 1 ? "" : "s"} will be included.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col rounded-3xl border bg-card p-8">
              <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                <FileText className="size-7" aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl font-bold">PDF report</h2>
              <p className="mt-2 flex-1 text-lg text-muted-foreground">
                A readable summary to share with a partner, accountant or advisor.
              </p>
              <a href="/api/exports/pdf" download className={`${buttonClass({ size: "lg" })} mt-6 w-fit`}>
                <FileDown className="size-5" aria-hidden /> Download PDF
              </a>
            </div>
            <div className="flex flex-col rounded-3xl border bg-card p-8">
              <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                <FileSpreadsheet className="size-7" aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl font-bold">CSV spreadsheet</h2>
              <p className="mt-2 flex-1 text-lg text-muted-foreground">
                One row per contract with dates and obligations, ready for Excel or Google Sheets.
              </p>
              <a href="/api/exports/csv" download className={`${buttonClass({ size: "lg", variant: "outline" })} mt-6 w-fit`}>
                <FileDown className="size-5" aria-hidden /> Download CSV
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ExportsPage() {
  return (
    <main className="mx-auto w-full max-w-[96rem] px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
      <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-muted/60" aria-hidden />}>
        <ExportsContent />
      </Suspense>
    </main>
  );
}
