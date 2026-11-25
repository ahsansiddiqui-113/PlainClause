import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "How cancellations and refunds work for PlainClause Pro.",
  alternates: { canonical: "/legal/refund-policy" },
};

export default function Page() {
  return (
    <LegalPage title="Refund Policy">
      <h2>Cancelling</h2>
      <p>
        You can cancel Pro at any time from your billing page. You keep Pro access until the end of the
        period you already paid for, and you will not be charged again.
      </p>

      <h2>Refunds</h2>
      <p>
        If PlainClause Pro isn&apos;t right for you, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> within 14 days of a payment and we will
        refund it in full, no questions asked. Refunds are returned to the original payment method.
        Statutory consumer rights where you live are not affected.
      </p>

      <h2>Payments</h2>
      <p>
        Payments are processed by our payment provider, which acts as merchant of record. Receipts and
        invoices are emailed to you by the provider.
      </p>
    </LegalPage>
  );
}
