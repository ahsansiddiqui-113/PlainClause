import Link from "next/link";
import { ArrowRight, CalendarClock, FileSearch, Scale, ScanText, Sparkles, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { getAllPosts } from "@/lib/posts";

const tools = [
  {
    href: "/tools/clause-scanner",
    icon: ScanText,
    title: "Red-Flag Clause Scanner",
    desc: "Paste a clause from a lease, freelance contract or job offer and get a plain-English translation with risk flags.",
  },
  {
    href: "/tools/notice-period-calculator",
    icon: CalendarClock,
    title: "Notice Period Calculator",
    desc: "Find the last day to give notice before your lease ends or auto-renews, and prorate first-month rent.",
  },
  {
    href: "/tools/deposit-deduction-checker",
    icon: WalletCards,
    title: "Deposit Deduction Checker",
    desc: "Add up your landlord's itemized deductions and see how much of your deposit you should get back.",
  },
];

const steps = [
  { icon: FileSearch, title: "Paste a clause", desc: "Copy one or two paragraphs from any lease, contract or policy." },
  { icon: Sparkles, title: "Get it in plain English", desc: "See what it means for you and which parts are risky, with quotes from your own text." },
  { icon: Scale, title: "Know what to ask for", desc: "Walk into the conversation knowing what to question or negotiate." },
];

export default function Home() {
  const posts = getAllPosts().filter((p) => !p.isPremium).slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-[radial-gradient(60rem_30rem_at_50%_-10%,var(--accent),transparent)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge variant="secondary" className="h-auto px-3 py-1 text-xs">
              Free to use · No signup
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Understand the fine print <span className="text-primary">before you sign it</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Free tools that translate leases, freelance contracts and job offers into plain
              English, and flag the clauses that can cost you money.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/tools/clause-scanner" className={buttonClass({ size: "lg" })}>
                Scan a clause free <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/tools/notice-period-calculator"
                className={buttonClass({ size: "lg", variant: "outline" })}
              >
                Check a notice deadline
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              General information, not legal advice. 3 free scans per day.
            </p>
          </div>

          {/* Illustrative example of a result */}
          <div className="relative" aria-label="Example scan result">
            <div className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5 sm:p-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Example result
              </p>
              <blockquote className="rounded-lg border-l-4 border-primary bg-accent px-4 py-3 text-sm">
                &ldquo;Landlord may retain the entire security deposit as liquidated damages upon
                termination for any reason.&rdquo;
              </blockquote>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
                  HIGH RISK
                </span>
                <span className="text-sm font-medium">Deposit can be kept in full</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                This lets the landlord keep your whole deposit no matter what condition the place is
                in. Many places limit deductions to actual damage beyond normal wear and tear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <s.icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">
                  {i + 1}. {s.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Tools */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Free tools</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {tools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
                  <t.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open tool
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest guides */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Latest guides</h2>
            <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
              All guides
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex flex-col rounded-xl border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-primary">{p.category}</span>
                  {p.isPremium && <Badge variant="secondary">Pro</Badge>}
                </div>
                <h3 className="mt-2 font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
