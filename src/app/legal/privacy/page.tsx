import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PlainClause processes the contract text you submit, what we store, and what we never do with it.",
  alternates: { canonical: "/legal/privacy" },
};

export default function Page() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what PlainClause collects, how contract text is processed, and the
        choices you have. We keep it plain on purpose.
      </p>

      <h2>Contract text you submit</h2>
      <ul>
        <li>
          When you scan text, it is sent to our server and then to a third-party AI provider
          (currently Google&apos;s Gemini API) solely to generate your analysis.
        </li>
        <li>
          <strong>Free anonymous scans are not saved</strong> on our servers. The result stays in
          your browser tab (session storage) so you can save it to an account later.
        </li>
        <li>
          If you create an account and save a document to your vault, we store the analysis
          results, the text you chose to save, and metadata (title, risk summary, key dates) so you can access them and receive
          deadline reminders. You can delete saved documents at any time.
        </li>
        <li>
          We do not sell your contract text, and we do not use it to train public AI models. We
          use AI providers under terms that do not allow them to train on API data; we review
          those terms when they change.
        </li>
        <li>
          Please remove names, addresses, account numbers and other sensitive details before you
          paste text.
        </li>
      </ul>

      <h2>Other information we collect</h2>
      <ul>
        <li>
          <strong>Usage limits:</strong> to prevent abuse, we keep a daily counter tied to your IP
          address (anonymous visitors) or account (signed-in users).
        </li>
        <li>
          <strong>Account data:</strong> if you sign up, your email, name and plan. Payments are
          handled by our payment provider; we never see your full card number.
        </li>
        <li>
          <strong>Analytics and errors:</strong> we may use privacy-conscious product analytics and
          error logging to fix bugs and improve the tools.
        </li>
        <li>
          <strong>Advertising cookies:</strong> free public pages may show ads. Where required (for
          example in the EEA and UK) we ask for your consent first, and you can decline. Pro
          members do not see ads.
        </li>
      </ul>

      <h2>Who we share data with</h2>
      <p>
        Only service providers that help us run PlainClause: hosting, database, AI analysis,
        email delivery, payments, analytics and advertising. They may process data only to provide
        their service to us.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Usage counters are short-lived. Saved documents remain until you delete them or close your
        account. To request deletion of your data, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example under GDPR or CCPA) you may have the right to
        access, correct, export or delete your personal data, and to object to certain
        processing. Contact us at the email above and we will respond within a reasonable time.
      </p>

      <h2>Children</h2>
      <p>PlainClause is not directed to children under 16, and we do not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>If we make material changes, we will update the date above and, where appropriate, notify you.</p>
    </LegalPage>
  );
}
