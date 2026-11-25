import type { Metadata } from "next";
import { JsonLd, softwareJsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { ClauseScanner } from "@/components/tools/clause-scanner";
import { RelatedTools, RiskLegend, ToolShell, TrustNote } from "@/components/site/tool-shell";

export const metadata: Metadata = {
  title: "Free Contract Red-Flag Clause Scanner",
  description:
    "Paste a contract clause and get a plain-English translation with color-coded risk flags. Free, no signup.",
  alternates: { canonical: "/tools/clause-scanner" },
};

export default function ClauseScannerPage() {
  return (
    <>
      <JsonLd
        data={softwareJsonLd({
          name: "Red-Flag Clause Scanner",
          description: String(metadata.description),
          url: absoluteUrl("/tools/clause-scanner"),
        })}
      />
      <ToolShell
        eyebrow="Free tool · 3 scans a day"
        title="Red-Flag Clause Scanner"
        intro="Paste a lease, freelance or job-offer clause and see what it really means, and what to watch out for."
        aside={
          <>
            <RiskLegend />
            <TrustNote />
            <RelatedTools exclude="/tools/clause-scanner" />
          </>
        }
      >
        <ClauseScanner />
        <p className="text-sm text-muted-foreground">
          Informational and educational tool only. Not a law firm or a substitute for licensed legal counsel.
        </p>
      </ToolShell>
    </>
  );
}
