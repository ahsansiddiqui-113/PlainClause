import Link from "next/link";
import { ClauseScanner } from "@/components/tools/clause-scanner";
import { faqJsonLd, JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
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
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6">
      <JsonLd
        data={[
          softwareJsonLd({ name: c.h1, description: c.intro, url: absoluteUrl(c.path) }),
          faqJsonLd(c.faqs),
        ]}
      />
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.h1}</h1>
        <p className="text-muted-foreground">{c.intro}</p>
      </header>

      <section aria-labelledby="try" className="space-y-3">
        <h2 id="try" className="text-xl font-semibold">
          Try it on your own text
        </h2>
        <p className="text-sm text-muted-foreground">
          We pre-filled a typical clause. Replace it with yours. 3 free scans per day, no signup.
        </p>
        <ClauseScanner presetText={c.presetText} />
      </section>

      <section aria-labelledby="look" className="space-y-4">
        <h2 id="look" className="text-xl font-semibold">
          What to look for
        </h2>
        <ul className="space-y-3">
          {c.lookFor.map((l) => (
            <li key={l.title}>
              <h3 className="font-medium">{l.title}</h3>
              <p className="text-sm text-muted-foreground">{l.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="space-y-4">
        <h2 id="faq" className="text-xl font-semibold">
          Frequently asked questions
        </h2>
        {c.faqs.map((f) => (
          <div key={f.q}>
            <h3 className="font-medium">{f.q}</h3>
            <p className="text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </section>

      <nav aria-label="Related tools" className="flex flex-wrap gap-4 text-sm">
        {c.related.map((r) => (
          <Link key={r.href} href={r.href} className="underline underline-offset-4">
            {r.label}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-muted-foreground">
        Informational and educational tool only. Not a law firm or a substitute for licensed legal
        counsel.
      </p>
    </main>
  );
}
