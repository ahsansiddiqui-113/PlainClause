import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, FileText, Sparkles } from "lucide-react";
import { buildDeadlines, riskTier, urgency } from "@/lib/deadlines";
import { getCurrentUser } from "@/lib/session";
import { listDocuments } from "@/lib/vault";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const tierStyle = {
  high: { text: "High risk", cls: "bg-red-600 text-white" },
  medium: { text: "Medium risk", cls: "bg-amber-500 text-black" },
  low: { text: "Low risk", cls: "bg-green-600 text-white" },
  none: { text: "Unscored", cls: "bg-muted text-muted-foreground" },
} as const;

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string | number; icon: typeof FileText; tone?: string }) {
  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-muted-foreground">{label}</p>
        <span className={`grid size-10 place-items-center rounded-xl ${tone ?? "bg-accent text-primary"}`}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-4xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}

async function DashboardContent({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const { saved } = await searchParams;
  const docs = await listDocuments(user.id);

  const deadlines = buildDeadlines(docs);
  const highRisk = docs.filter((d) => riskTier(d.riskScore) === "high");
  const dueSoon = deadlines.filter((d) => d.daysLeft >= 0 && d.daysLeft <= 30).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your vault</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Signed in as {user.email} · {user.plan === "pro" ? "Pro plan" : "Free plan"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-base font-medium">
          <Link href="/dashboard/upload" className="inline-flex items-center gap-2 text-primary hover:underline">
            Scan a document <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/tools/clause-scanner" className="inline-flex items-center gap-2 text-primary hover:underline">
            Scan a clause <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      {saved && (
        <div role="status" className="rounded-2xl border border-green-600/30 bg-green-50 px-5 py-4 text-base text-green-900">
          Saved to your vault.
        </div>
      )}

      <section aria-label="Summary" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Saved documents" value={docs.length} icon={FileText} />
        <Stat label="High-risk" value={highRisk.length} icon={AlertTriangle} tone="bg-red-100 text-red-700" />
        <Stat label="Deadlines in 30 days" value={dueSoon} icon={CalendarClock} tone="bg-amber-100 text-amber-800" />
        <div className="rounded-3xl border bg-primary p-6 text-primary-foreground">
          <p className="text-base font-medium text-primary-foreground/80">Plan</p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight">{user.plan === "pro" ? "Pro" : "Free"}</p>
          {user.plan !== "pro" && (
            <Link href="/pricing" className="mt-2 inline-flex items-center gap-1 text-base font-semibold underline-offset-4 hover:underline">
              Upgrade for exports and reminders <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </section>

      {docs.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed p-14 text-center">
          <Sparkles className="mx-auto size-10 text-primary" aria-hidden />
          <p className="mt-4 text-2xl font-semibold">Nothing saved yet</p>
          <p className="mt-2 text-lg text-muted-foreground">
            Scan a clause and choose Save to Vault, or upload a whole document.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-lg font-medium">
            <Link href="/tools/clause-scanner" className="text-primary hover:underline">
              Scan a clause
            </Link>
            <Link href="/dashboard/upload" className="text-primary hover:underline">
              Upload a document
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <section aria-labelledby="deadlines" className="rounded-3xl border bg-card p-7">
              <h2 id="deadlines" className="flex items-center gap-2 text-2xl font-bold">
                <CalendarClock className="size-6 text-primary" aria-hidden /> Upcoming deadlines
              </h2>
              {deadlines.length === 0 ? (
                <p className="mt-4 text-lg text-muted-foreground">
                  No dates found in your saved documents yet. Scans with notice or renewal dates will show up here.
                </p>
              ) : (
                <ul className="mt-5 divide-y">
                  {deadlines.slice(0, 8).map((d) => {
                    const u = urgency(d.daysLeft);
                    return (
                      <li key={`${d.docId}-${d.kind}`}>
                        <Link href={`/dashboard/documents/${d.docId}`} className="flex items-center justify-between gap-4 py-4 hover:text-primary">
                          <span className="min-w-0">
                            <span className="block truncate text-lg font-medium">{d.title}</span>
                            <span className="text-base text-muted-foreground">
                              {d.kind === "notice" ? "Notice deadline" : "Renewal"} · {d.date}
                            </span>
                          </span>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${u.cls}`}>{u.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section aria-labelledby="alerts" className="rounded-3xl border bg-card p-7">
              <h2 id="alerts" className="flex items-center gap-2 text-2xl font-bold">
                <AlertTriangle className="size-6 text-red-600" aria-hidden /> High-risk alerts
              </h2>
              {highRisk.length === 0 ? (
                <p className="mt-4 text-lg text-muted-foreground">No high-risk documents. Nice.</p>
              ) : (
                <ul className="mt-5 divide-y">
                  {highRisk.slice(0, 8).map((d) => (
                    <li key={d.id}>
                      <Link href={`/dashboard/documents/${d.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-primary">
                        <span className="min-w-0 truncate text-lg font-medium">{d.title}</span>
                        <span className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                          Score {d.riskScore}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section aria-labelledby="all">
            <h2 id="all" className="text-2xl font-bold">
              All documents
            </h2>
            <ul className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {docs.map((d) => {
                const t = tierStyle[riskTier(d.riskScore)];
                return (
                  <li key={d.id}>
                    <Link
                      href={`/dashboard/documents/${d.id}`}
                      className="group block h-full rounded-3xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${t.cls}`}>{t.text}</span>
                        <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                          {d.docType === "document" ? "Document" : "Clause"}
                        </span>
                        <time className="text-sm text-muted-foreground" dateTime={d.createdAt.toISOString()}>
                          {d.createdAt.toISOString().slice(0, 10)}
                        </time>
                      </div>
                      <p className="mt-3 text-xl font-semibold leading-snug group-hover:text-primary">{d.title}</p>
                      {(d.noticeDeadlineDate || d.renewalDate) && (
                        <p className="mt-2 text-base text-muted-foreground">
                          {d.noticeDeadlineDate && <>Notice by {d.noticeDeadlineDate}</>}
                          {d.noticeDeadlineDate && d.renewalDate && " · "}
                          {d.renewalDate && <>Renews {d.renewalDate}</>}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default function DashboardPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  return (
    <main className="mx-auto w-full max-w-[96rem] px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-muted/60" aria-hidden />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
