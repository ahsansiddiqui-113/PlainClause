import { LEGAL_UPDATED } from "@/lib/site";

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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <h1>{title}</h1>
        {showUpdated && <p className="text-sm text-muted-foreground">Last updated: {LEGAL_UPDATED}</p>}
        {children}
      </article>
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
