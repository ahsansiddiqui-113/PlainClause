import type { Metadata } from "next";
import { LegalPage, NotLegalAdvice } from "@/components/site/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use PlainClause's tools, articles and paid plans.",
  alternates: { canonical: "/legal/terms" },
};

export default function Page() {
  return (
    <LegalPage title="Terms of Service">
      <NotLegalAdvice />
      <h2>1. Agreement</h2>
      <p>
        By using PlainClause you agree to these terms. If you do not agree, please do not use the
        service.
      </p>

      <h2>2. What the service is</h2>
      <p>
        PlainClause offers AI-assisted explanations of contract text, calculators and educational
        articles. It is informational only and is not legal advice (see the{" "}
        <a href="/legal/disclaimer">Disclaimer</a>). You are responsible for decisions you make.
      </p>

      <h2>3. Acceptable use</h2>
      <ul>
        <li>Do not abuse, overload or attempt to bypass usage limits or the paywall.</li>
        <li>Do not scrape the service or use it to build a competing dataset or product.</li>
        <li>Do not submit content you have no right to share, or unlawful content.</li>
        <li>Do not try to manipulate the AI with instructions hidden in submitted text.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You keep ownership of text and documents you submit. You give us a limited licence to
        process them to provide the service to you, as described in the{" "}
        <a href="/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>5. Accounts and plans</h2>
      <p>
        Free users have daily and per-document limits. Pro plans are billed monthly or annually
        through our payment provider and renew until cancelled. You can cancel at any time and keep
        access until the end of the paid period. Refunds are handled as described at checkout and
        as required by law.
      </p>

      <h2>6. Content and intellectual property</h2>
      <p>
        Articles, design and software on PlainClause belong to us or our licensors. Premium
        articles are for your personal use and may not be republished.
      </p>

      <h2>7. No warranty</h2>
      <p>
        The service is provided &quot;as is&quot; and &quot;as available&quot;. We do not warrant
        that analysis is accurate, complete or fit for a particular purpose.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, PlainClause will not be liable for indirect or
        consequential losses, or for losses arising from reliance on the service. Our total
        liability for any claim is limited to the amount you paid us in the 12 months before the
        claim. Some jurisdictions do not allow certain limits, so parts of this section may not
        apply to you.
      </p>

      <h2>9. Termination</h2>
      <p>We may suspend or end access for violations of these terms. You may stop using the service at any time.</p>

      <h2>10. Changes and contact</h2>
      <p>
        We may update these terms and will change the date above when we do. Continued use means
        you accept the updated terms. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
