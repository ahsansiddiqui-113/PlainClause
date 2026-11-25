import Link from "next/link";
import { Wrap } from "@/components/site/wrap";
import { LEGAL_UPDATED } from "@/lib/site";

const nav = [
  { href: "/about", label: "About" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
];

export function LegalPage({
  title,
  children,
  showUpdated = true,
}: {
  title: string;
  children: React.ReactNode;
  showUpdated?: boolean;
}) {
  return (
    <main>
      <Wrap className="grid gap-10 py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:py-16">
        <nav aria-label="Legal and company" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block rounded-lg px-4 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      <article className="prose prose-neutral prose-lg max-w-5xl dark:prose-invert xl:prose-xl">
        <h1 className="!text-4xl !font-extrabold sm:!text-5xl">{title}</h1>
        {showUpdated && <p className="text-sm text-muted-foreground">Last updated: {LEGAL_UPDATED}</p>}
        {children}
      </article>
      </Wrap>
    </main>
  );
}

export function NotLegalAdvice() {
  return (
    <div
      role="note"
      className="not-prose rounded-lg border-2 border-amber-500 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <p className="font-semibold">Informational &amp; educational tool only</p>
      <p className="mt-1 text-sm">
        PlainClause is not a law firm and does not provide legal advice. Nothing here is a
        substitute for licensed legal counsel, and using PlainClause does not create an
        attorney-client relationship.
      </p>
    </div>
  );
}
