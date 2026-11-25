import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CalendarClock, Lock, Mail } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { CopyButton, DeleteButton } from "@/components/dashboard/document-actions";
import { buildDeadlines, riskTier, urgency } from "@/lib/deadlines";
import { getCurrentUser } from "@/lib/session";
import { getDocument } from "@/lib/vault";

export const metadata: Metadata = {
  title: "Document",
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sev = {
  HIGH: "bg-red-600 text-white",
  MEDIUM: "bg-amber-500 text-black",
  LOW: "bg-green-600 text-white",
} as const;

const tier = {
  high: { text: "High risk", cls: "bg-red-600 text-white" },
  medium: { text: "Medium risk", cls: "bg-amber-500 text-black" },
  low: { text: "Low risk", cls: "bg-green-600 text-white" },
  none: { text: "Unscored", cls: "bg-muted text-muted-foreground" },
} as const;

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border bg-card p-7 ${className}`}>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function DocumentContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/dashboard/documents/${id}`)}`);
  if (!UUID.test(id)) notFound();

  const doc = await getDocument(user.id, id);
  if (!doc) notFound();

  const isPro = user.plan === "pro";
  const t = tier[riskTier(doc.riskScore)];
  const a = doc.analysis;
  const deadlines = buildDeadlines([doc], undefined, 3650);
  // The full email only ever leaves the server for Pro users.
  const email = a?.negotiationCounterScript ?? "";
  const teaser = email.length > 140 ? `${email.slice(0, 140)}…` : email;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Back to dashboard
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-3 py-1 text-sm font-semibold ${t.cls}`}>{t.text}</span>
              {doc.riskScore !== null && <span className="text-base text-muted-foreground">Score {doc.riskScore}/100</span>}
              <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                {doc.docType === "document" ? "Document" : "Clause"}
              </span>
              <time className="text-base text-muted-foreground" dateTime={doc.createdAt.toISOString()}>
                Saved {doc.createdAt.toISOString().slice(0, 10)}
              </time>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{doc.title}</h1>
          </div>
          <DeleteButton id={doc.id} title={doc.title} />
        </div>
      </header>

      {!a ? (
        <Card title="Analysis unavailable">
          <p className="text-lg text-muted-foreground">We couldn&apos;t read the saved analysis for this document.</p>
        </Card>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-2">
          {/* Left: what it means */}
          <div className="space-y-6">
            <Card title="Plain-English summary">
              <p className="text-lg leading-relaxed">{a.plainEnglishSummary}</p>
            </Card>

            <Card title={`Red flags (${a.redFlags.length})`}>
              {a.redFlags.length === 0 ? (
                <p className="text-lg text-muted-foreground">No red flags were found in the analyzed text.</p>
              ) : (
                <ul className="space-y-6">
                  {a.redFlags.map((f, i) => (
                    <li key={i} className="space-y-2 border-l-4 border-primary/30 pl-5">
                      <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${sev[f.severity]}`}>{f.severity}</span>
                      <blockquote className="text-lg italic">“{f.clauseQuote}”</blockquote>
                      <p className="text-lg text-muted-foreground">{f.whyItMatters}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {doc.sourceText ? (
              <Card title="Original text">
                <p className="whitespace-pre-wrap rounded-2xl bg-muted/60 p-5 text-base">{doc.sourceText}</p>
              </Card>
            ) : (
              <Card title="Source">
                <p className="text-lg text-muted-foreground">
                  {doc.fileName ? <>From <span className="font-medium text-foreground">{doc.fileName}</span>. </> : null}
                  {doc.pagesRead !== null && <>Analyzed {doc.pagesRead} of {doc.totalPages} pages. </>}
                  Uploaded files aren&apos;t stored; only this analysis is kept.
                </p>
              </Card>
            )}
          </div>

          {/* Right: what to do */}
          <div className="space-y-6 xl:sticky xl:top-24">
            <Card title="Key dates">
              {a.extractedDates.length === 0 && deadlines.length === 0 ? (
                <p className="text-lg text-muted-foreground">No dates were found in this document.</p>
              ) : (
                <ul className="space-y-4">
                  {a.extractedDates.map((d, i) => {
                    const dl = deadlines.find((x) => x.date === d.date);
                    const u = dl ? urgency(dl.daysLeft) : null;
                    return (
                      <li key={i} className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-lg font-semibold">
                            <CalendarClock className="size-5 shrink-0 text-primary" aria-hidden />
                            {d.label}
                          </p>
                          <p className="text-base text-muted-foreground">
                            {d.date}
                            {d.actionRequired && d.actionRequired.toLowerCase() !== "none" && <> · {d.actionRequired}</>}
                          </p>
                        </div>
                        {u && <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${u.cls}`}>{u.label}</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card title="Negotiation email draft">
              {isPro && email ? (
                <div className="space-y-4">
                  <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-muted/60 p-5 font-sans text-base leading-relaxed">
                    {email}
                  </pre>
                  <CopyButton text={email} />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border bg-muted/40 p-5">
                  <p aria-hidden className="select-none text-base blur-sm">
                    {teaser} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                    labore et dolore magna aliqua.
                  </p>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 p-4 text-center">
                    <Lock className="size-6 text-primary" aria-hidden />
                    <p className="text-lg font-semibold">Unlock the full email draft with Pro</p>
                    <Link href="/pricing" className={buttonClass()}>
                      <Mail className="size-4" aria-hidden /> Upgrade to Pro
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground">Informational only, not legal advice.</p>
    </div>
  );
}

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto w-full max-w-[96rem] px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-3xl bg-muted/60" aria-hidden />}>
        <DocumentContent params={params} />
      </Suspense>
    </main>
  );
}
