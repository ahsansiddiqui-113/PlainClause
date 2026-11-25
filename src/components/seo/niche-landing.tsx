import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClauseScanner } from "@/components/tools/clause-scanner";
import { faqJsonLd, JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
import { SideCard, ToolShell, TrustNote } from "@/components/site/tool-shell";
import { absoluteUrl } from "@/lib/site";

export type NicheContent = {
  path: string;
  h1: string;
  intro: string;
  presetText: string;
  lookFor: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
};

export function NicheLanding({ c }: { c: NicheContent }) {
  return (
    <>
      <JsonLd
        data={[
          softwareJsonLd({ name: c.h1, description: c.intro, url: absoluteUrl(c.path) }),
          faqJsonLd(c.faqs),
        ]}
      />
      <ToolShell
        eyebrow="Free scanner · 3 scans a day"
        title={c.h1}
        intro={c.intro}
        aside={
          <>
            <SideCard title="What to look for">
              <ul className="space-y-4">
                {c.lookFor.map((l) => (
                  <li key={l.title}>
                    <h3 className="font-semibold text-foreground">{l.title}</h3>
                    <p className="mt-0.5">{l.body}</p>
                  </li>
                ))}
              </ul>
            </SideCard>
            <TrustNote />
          </>
        }
      >
        <section aria-labelledby="try" className="space-y-4">
          <h2 id="try" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Try it on your own text
          </h2>
          <p className="text-lg text-muted-foreground">
            We pre-filled a typical clause. Replace it with yours. 3 free scans per day, no signup.
          </p>
          <ClauseScanner presetText={c.presetText} />
        </section>

        <section aria-labelledby="faq" className="space-y-5">
          <h2 id="faq" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {c.faqs.map((f) => (
              <div key={f.q} className="rounded-3xl border bg-card p-6">
                <h3 className="text-lg font-semibold">{f.q}</h3>
                <p className="mt-2 text-base text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav aria-label="Related tools" className="flex flex-wrap gap-3">
          {c.related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-base font-medium transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {r.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          Informational and educational tool only. Not a law firm or a substitute for licensed legal counsel.
        </p>
      </ToolShell>
    </>
  );
}
