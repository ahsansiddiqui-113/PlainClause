import Link from "next/link";
import { ArrowRight, CalendarClock, ScanText, ShieldCheck, WalletCards } from "lucide-react";
import { Wrap } from "@/components/site/wrap";

export function ToolShell({
  eyebrow,
  title,
  intro,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <main>
      <section className="relative isolate overflow-hidden border-b bg-muted/40">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="absolute -right-24 -top-24 -z-10 size-[24rem] rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <Wrap className="py-12 lg:py-16">
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            {eyebrow}
          </span>
          <h1 className="mt-5 max-w-5xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-4xl text-xl text-muted-foreground sm:text-2xl">{intro}</p>
        </Wrap>
      </section>
      <Wrap className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14 lg:py-16 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="min-w-0 space-y-10">{children}</div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">{aside}</aside>
      </Wrap>
    </main>
  );
}

export function SideCard({ title, children, tone = "default" }: { title: string; children: React.ReactNode; tone?: "default" | "accent" }) {
  return (
    <div className={`rounded-3xl border p-6 ${tone === "accent" ? "bg-accent/60" : "bg-card"}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-base text-muted-foreground">{children}</div>
    </div>
  );
}

export function RiskLegend() {
  return (
    <SideCard title="How to read your result">
      {[
        ["bg-green-600", "LOW", "Looks standard. Still read it."],
        ["bg-amber-500", "MEDIUM", "Worth asking about before you sign."],
        ["bg-red-600", "HIGH", "Could cost you real money. Negotiate or get advice."],
      ].map(([c, l, d]) => (
        <div key={l} className="flex items-start gap-3">
          <span className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${c} ${l === "MEDIUM" ? "text-black" : "text-white"}`}>
            {l}
          </span>
          <span>{d}</span>
        </div>
      ))}
    </SideCard>
  );
}

const tools = [
  { href: "/tools/clause-scanner", icon: ScanText, label: "Clause scanner" },
  { href: "/tools/notice-period-calculator", icon: CalendarClock, label: "Notice period calculator" },
  { href: "/tools/deposit-deduction-checker", icon: WalletCards, label: "Deposit deduction checker" },
];

export function RelatedTools({ exclude }: { exclude?: string }) {
  return (
    <SideCard title="More free tools">
      <ul className="space-y-1">
        {tools
          .filter((t) => t.href !== exclude)
          .map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3 font-medium text-foreground transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-3">
                  <t.icon className="size-5 text-primary" aria-hidden />
                  {t.label}
                </span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </li>
          ))}
      </ul>
    </SideCard>
  );
}

export function TrustNote() {
  return (
    <SideCard title="Your privacy" tone="accent">
      <p className="flex gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <span>
          Free scans aren&apos;t saved on our servers. Remove names and account numbers before you paste. This is
          general information, not legal advice.
        </span>
      </p>
    </SideCard>
  );
}
