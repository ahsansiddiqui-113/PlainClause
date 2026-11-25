import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { listDocuments } from "@/lib/vault";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

function riskLabel(score: number | null) {
  if (score === null) return { text: "Unscored", cls: "bg-muted text-muted-foreground" };
  if (score >= 70) return { text: "High risk", cls: "bg-red-600 text-white" };
  if (score >= 40) return { text: "Medium risk", cls: "bg-amber-500 text-black" };
  return { text: "Low risk", cls: "bg-green-600 text-white" };
}

async function DashboardContent({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const { saved } = await searchParams;
  const docs = await listDocuments(user.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your vault</h1>
          <p className="text-muted-foreground">
            Signed in as {user.email} · {user.plan === "pro" ? "Pro plan" : "Free plan"}
          </p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/dashboard/upload" className="text-primary hover:underline">
            Scan a document
          </Link>
          <Link href="/tools/clause-scanner" className="text-primary hover:underline">
            Scan a clause
          </Link>
        </div>
      </header>

      {saved && (
        <div role="status" className="rounded-lg border border-green-600/30 bg-green-50 px-4 py-3 text-sm text-green-900">
          Saved to your vault.
        </div>
      )}

      {docs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan a clause and choose Save to Vault to keep it here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {docs.map((d) => {
            const r = riskLabel(d.riskScore);
            return (
              <li key={d.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${r.cls}`}>{r.text}</span>
                  <time className="text-xs text-muted-foreground" dateTime={d.createdAt.toISOString()}>
                    {d.createdAt.toISOString().slice(0, 10)}
                  </time>
                </div>
                <p className="mt-2 font-medium">{d.title}</p>
                {(d.noticeDeadlineDate || d.renewalDate) && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.noticeDeadlineDate && <>Notice deadline: {d.noticeDeadlineDate}</>}
                    {d.noticeDeadlineDate && d.renewalDate && " · "}
                    {d.renewalDate && <>Renewal: {d.renewalDate}</>}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted/60" aria-hidden />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
