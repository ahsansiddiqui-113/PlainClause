import type { Metadata } from "next";
import { JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { ClauseScanner } from "@/components/tools/clause-scanner";

export const metadata: Metadata = {
  title: "Free Contract Red-Flag Clause Scanner",
  description:
    "Paste a contract clause and get a plain-English translation with color-coded risk flags. Free, no signup.",
  alternates: { canonical: "/tools/clause-scanner" },
};

export default function ClauseScannerPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <JsonLd data={softwareJsonLd({ name: "Red-Flag Clause Scanner", description: String(metadata.description), url: absoluteUrl("/tools/clause-scanner") })} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Red-Flag Clause Scanner</h1>
        <p className="text-muted-foreground">
          Paste a lease, freelance or job-offer clause and see what it really means, and what to
          watch out for. 3 free scans per day.
        </p>
      </header>
      <ClauseScanner />
      <p className="text-xs text-muted-foreground">
        Informational and educational tool only. Not a law firm or a substitute for licensed legal
        counsel.
      </p>
    </main>
  );
}
