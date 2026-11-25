import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  Check,
  FileSearch,
  Gavel,
  Handshake,
  KeyRound,
  Lock,
  Repeat,
  Scale,
  ScanText,
  ShieldAlert,
  Sparkles,
  Umbrella,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Wrap } from "@/components/site/wrap";
import { getAllPosts } from "@/lib/posts";

const topics = [
  "Auto-renewal clauses",
  "Security deposits",
  "Non-compete agreements",
  "Late payment fees",
  "IP assignment",
  "Mandatory arbitration",
  "Subscription cancellation",
  "Insurance exclusions",
  "Early termination fees",
  "Scope creep",
];

const flags = [
  { icon: Repeat, title: "Auto-renewals & lock-ins", desc: "Deadlines that quietly roll you into another year." },
  { icon: WalletCards, title: "Fees, penalties & deposits", desc: "Late fees, break fees and deductions that add up." },
  { icon: Briefcase, title: "Non-competes & clawbacks", desc: "Job-offer terms that follow you after you leave." },
  { icon: KeyRound, title: "Who owns your work", desc: "IP assignment and work-for-hire language." },
  { icon: Gavel, title: "Giving up your rights", desc: "Arbitration and class-action waivers." },
  { icon: Umbrella, title: "Insurance fine print", desc: "Exclusions and claim deadlines that void coverage." },
];

const steps = [
  { icon: FileSearch, title: "Paste a clause", desc: "Copy a paragraph or two from any lease, contract or policy. Or upload a whole PDF." },
  { icon: Sparkles, title: "See it in plain English", desc: "A clear translation plus red flags quoted straight from your own text." },
  { icon: Handshake, title: "Know what to ask for", desc: "Walk into the conversation prepared, with a polite email draft to push back." },
];

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  const posts = getAllPosts().filter((p) => !p.isPremium).slice(0, 4);

  return (
    <main className="overflow-x-clip">
      {/* ───────── Hero ───────── */}
      <section className="relative isolate border-b">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="animate-float-slow absolute -left-32 top-10 -z-10 size-[28rem] rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="animate-float absolute -right-24 top-40 -z-10 size-[26rem] rounded-full bg-sky-400/20 blur-3xl" aria-hidden />

        <Wrap className="grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div className="animate-rise space-y-8">
            <Badge variant="secondary" className="h-auto gap-2 px-4 py-1.5 text-sm">
              <span className="size-2 rounded-full bg-green-500" aria-hidden />
              Free to try · No signup needed
            </Badge>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
              Read the fine print{" "}
              <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                before it reads you.
              </span>
            </h1>
            <p className="max-w-2xl text-xl text-muted-foreground sm:text-2xl">
              Paste a lease, freelance contract or job offer. PlainClause translates it into plain English and
              flags the clauses that can cost you money.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tools/clause-scanner" className={buttonClass({ size: "lg" })}>
                Scan a clause free <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link href="/tools/notice-period-calculator" className={buttonClass({ size: "lg", variant: "outline" })}>
                Check a notice deadline
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base text-muted-foreground">
              {["3 free scans a day", "Your text isn't saved unless you choose", "Not legal advice, and we say so"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Annotated clause demo (illustrative) */}
          <div className="relative animate-rise [animation-delay:150ms]" aria-label="Example of a scanned clause">
            <div className="rounded-3xl border bg-card p-6 shadow-2xl shadow-primary/10 sm:p-8">
              <div className="mb-4 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Residential lease · Section 9</span>
                <span className="rounded-full bg-muted px-3 py-1 normal-case tracking-normal">Example</span>
              </div>
              <p className="text-lg leading-relaxed sm:text-xl">
                Tenant shall be responsible for all repairs{" "}
                <mark className="rounded bg-amber-200/80 px-1 text-foreground">regardless of cause</mark>. Landlord may{" "}
                <mark className="rounded bg-red-200/80 px-1 text-foreground">
                  retain the entire security deposit as liquidated damages
                </mark>{" "}
                upon termination for any reason.
              </p>
              <div className="mt-6 rounded-2xl bg-accent p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-red-600 px-3 py-1 text-sm font-bold text-white">HIGH RISK</span>
                  <span className="font-semibold">Your deposit can be kept in full</span>
                </div>
                <p className="mt-2 text-base text-muted-foreground">
                  No matter what condition you leave the home in. Many places limit deductions to real damage beyond
                  normal wear and tear.
                </p>
              </div>
            </div>
            <div className="animate-float absolute -left-6 -top-6 hidden rounded-2xl border bg-card px-4 py-3 shadow-lg sm:flex sm:items-center sm:gap-3">
              <ShieldAlert className="size-6 text-red-600" aria-hidden />
              <div className="text-sm">
                <div className="font-semibold">2 red flags</div>
                <div className="text-muted-foreground">found in 1 paragraph</div>
              </div>
            </div>
            <div className="animate-float-slow absolute -bottom-6 -right-4 hidden rounded-2xl border bg-card px-4 py-3 shadow-lg sm:flex sm:items-center sm:gap-3">
              <Sparkles className="size-6 text-primary" aria-hidden />
              <div className="text-sm">
                <div className="font-semibold">Email draft ready</div>
                <div className="text-muted-foreground">to push back politely</div>
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ───────── Topic marquee ───────── */}
      <section aria-label="Topics we cover" className="marquee overflow-hidden border-b bg-muted/50 py-5">
        <div className="animate-marquee flex w-max gap-4">
          {[...topics, ...topics].map((t, i) => (
            <span
              key={i}
              aria-hidden={i >= topics.length}
              className="whitespace-nowrap rounded-full border bg-background px-5 py-2 text-base font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="py-20 lg:py-28">
        <Wrap>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">From legalese to “oh, that’s what it means.”</h2>
          </div>
          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="group relative overflow-hidden rounded-3xl border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <span className="absolute -right-3 -top-6 select-none text-[9rem] font-black leading-none text-primary/[0.06]" aria-hidden>
                  {i + 1}
                </span>
                <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <s.icon className="size-7" aria-hidden />
                </span>
                <h3 className="mt-6 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-lg text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </Wrap>
      </section>

      {/* ───────── Tools (bento) ───────── */}
      <section className="border-y bg-muted/40 py-20 lg:py-28">
        <Wrap>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Free tools</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Three tools. Zero cost to try.</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:grid-rows-2">
            <Link
              href="/tools/clause-scanner"
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground transition-transform hover:-translate-y-1 sm:p-10 lg:col-span-2 lg:row-span-2"
            >
              <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
              <ScanText className="relative size-12" aria-hidden />
              <h3 className="relative mt-6 text-3xl font-bold sm:text-4xl">Red-Flag Clause Scanner</h3>
              <p className="relative mt-4 max-w-xl text-xl text-primary-foreground/85">
                Paste a clause and get a plain-English translation, color-coded risk flags and a polite email you can
                send to push back on the worst terms.
              </p>
              <ul className="relative mt-8 grid gap-3 text-lg sm:grid-cols-2">
                {["LOW / MEDIUM / HIGH risk rating", "Quotes the exact risky wording", "Upload whole PDFs with a free account", "Negotiation email draft"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-1 size-5 shrink-0" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <span className="relative mt-auto inline-flex items-center gap-2 pt-10 text-lg font-semibold">
                Open the scanner
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
            {[
              { href: "/tools/notice-period-calculator", icon: CalendarClock, title: "Notice Period Calculator", desc: "Find the last day to give notice before your lease ends or auto-renews. Shareable link, no AI." },
              { href: "/tools/deposit-deduction-checker", icon: WalletCards, title: "Deposit Deduction Checker", desc: "Add up your landlord's itemized deductions and see what you should get back." },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex flex-col rounded-3xl border bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                  <t.icon className="size-7" aria-hidden />
                </span>
                <h3 className="mt-5 text-2xl font-semibold">{t.title}</h3>
                <p className="mt-2 flex-1 text-lg text-muted-foreground">{t.desc}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-primary">
                  Open tool <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </Wrap>
      </section>

      {/* ───────── What we flag (dark band) ───────── */}
      <section className="relative isolate overflow-hidden bg-[oklch(0.2_0.06_262)] py-20 text-white lg:py-28">
        <div className="bg-grid-dark absolute inset-0 -z-10" aria-hidden />
        <div className="absolute -right-40 -top-40 -z-10 size-[34rem] rounded-full bg-sky-500/20 blur-3xl" aria-hidden />
        <Wrap>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-300">What we look for</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">The clauses that quietly cost people money.</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {flags.map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur transition-colors hover:bg-white/10">
                <f.icon className="size-9 text-sky-300" aria-hidden />
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-lg text-white/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* ───────── Guides ───────── */}
      {posts.length > 0 && (
        <section className="py-20 lg:py-28">
          <Wrap>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Guides</p>
                <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Learn before you sign.</h2>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline">
                All guides <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-3xl border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                >
                  <span className="w-fit rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">{p.category}</span>
                  <h3 className="mt-4 text-xl font-semibold leading-snug group-hover:text-primary">{p.title}</h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-base text-muted-foreground">{p.description}</p>
                </Link>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      {/* ───────── Final CTA ───────── */}
      <section className="px-5 pb-20 sm:px-8 lg:px-14 lg:pb-28">
        <div className="relative isolate mx-auto max-w-[96rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[oklch(0.3_0.12_250)] px-8 py-16 text-center text-primary-foreground sm:px-16 lg:py-24">
          <div className="bg-grid-dark absolute inset-0 -z-10 opacity-60" aria-hidden />
          <Scale className="mx-auto size-12 opacity-90" aria-hidden />
          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Before you sign, take two minutes to understand it.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-primary-foreground/85">
            Free, no signup, and your pasted text isn&apos;t stored unless you choose to save it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/tools/clause-scanner" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-7 text-lg font-semibold text-primary transition-transform hover:-translate-y-0.5">
              Scan a clause free <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link href="/blog" className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/40 px-7 text-lg font-semibold transition-colors hover:bg-white/10">
              <Lock className="size-4" aria-hidden /> Browse the guides
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
