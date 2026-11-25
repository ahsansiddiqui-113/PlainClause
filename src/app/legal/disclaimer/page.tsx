import type { Metadata } from "next";
import { LegalPage, NotLegalAdvice } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Legal Disclaimer",
  description: "PlainClause is an informational and educational tool only. It is not a law firm and does not give legal advice.",
  alternates: { canonical: "/legal/disclaimer" },
};

export default function Page() {
  return (
    <LegalPage title="Legal Disclaimer">
      <NotLegalAdvice />
      <h2>Not legal advice</h2>
      <p>
        The tools, calculators and articles on PlainClause provide general information to help you
        understand common contract language. They do not take your full circumstances, your
        jurisdiction or the rest of your document into account, and they are not legal advice.
      </p>
      <h2>AI-generated analysis can be wrong</h2>
      <p>
        Summaries, risk ratings and negotiation drafts are produced by an AI model. They may be
        incomplete, out of date or incorrect, and they can miss important clauses. A &quot;LOW
        RISK&quot; result does not mean a document is safe to sign.
      </p>
      <h2>Calculators are estimates</h2>
      <p>
        Date and money calculators use simple rules (for example, counting notice days back from an
        end date). Your lease or local law may count differently. Always confirm with your
        documents and the relevant authority.
      </p>
      <h2>When to talk to a professional</h2>
      <p>
        Before signing a significant contract, or if you are in a dispute, speak with a licensed
        attorney in your jurisdiction. Many areas also have free tenant, worker or small-business
        legal aid services.
      </p>
      <h2>No attorney-client relationship</h2>
      <p>
        Using PlainClause, including any email draft it generates, does not create an
        attorney-client relationship, and nothing you submit is protected by attorney-client
        privilege.
      </p>
    </LegalPage>
  );
}
