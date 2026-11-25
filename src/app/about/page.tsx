import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, NotLegalAdvice } from "@/components/site/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About PlainClause",
  description: "Why PlainClause exists, how the AI analysis works, and what it can and cannot do.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <LegalPage title="About PlainClause" showUpdated={false}>
      <p>
        Most people sign leases, client contracts and job offers they only half understand,
        because the language is dense and a lawyer is expensive. PlainClause translates fine print
        into plain English and points out clauses that deserve a second look, so you can ask better
        questions before you sign.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>
          <strong>AI clause scanner.</strong> An AI model reads the text you paste and returns a
          summary, risk rating, specific red flags quoted from your text, key dates and a polite
          negotiation email draft.
        </li>
        <li>
          <strong>Calculators.</strong> Notice-deadline, prorated rent and deposit tools use plain
          arithmetic with no AI, so results are predictable.
        </li>
        <li>
          <strong>Guides.</strong> Our articles explain common clauses with real examples and
          always carry a reminder that they are general information.
        </li>
      </ul>
      <h2>What it cannot do</h2>
      <p>
        PlainClause cannot tell you whether a clause is enforceable where you live, and AI can make
        mistakes. Treat it as a first read, not a final answer. See our{" "}
        <Link href="/legal/disclaimer">full disclaimer</Link>.
      </p>
      <NotLegalAdvice />
      <h2>Your privacy</h2>
      <p>
        We do not sell your documents or use them to train public AI models. Details are in the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
      <h2>Contact</h2>
      <p>
        Feedback, corrections or data requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
