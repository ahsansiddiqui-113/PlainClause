import type { Metadata } from "next";
import { NicheLanding, type NicheContent } from "@/components/seo/niche-landing";

const content: NicheContent = {
  path: "/tools/rental-lease-scanner",
  h1: "Rental Lease Scanner: Spot Costly Clauses Before You Sign",
  intro:
    "Paste a paragraph from your rental agreement and get a plain-English explanation plus the clauses that put your deposit, your deadlines or your wallet at risk.",
  presetText:
    "Tenant shall be responsible for all repairs and maintenance of the premises regardless of cause. Landlord may retain the entire security deposit as liquidated damages upon termination for any reason. Late rent incurs a fee of 15% of monthly rent plus $25 per day.",
  lookFor: [
    {
      title: "Deposit deductions",
      body: "Watch for clauses letting the landlord keep the whole deposit or deduct for ordinary wear and tear, which is normally not allowed.",
    },
    {
      title: "Auto-renewal and notice deadlines",
      body: "Many leases renew automatically unless you give written notice weeks in advance. Missing the date can lock you in for another term.",
    },
    {
      title: "Late fees and penalties",
      body: "Fees stacked as a percentage plus a daily charge can be far above what local law allows.",
    },
    {
      title: "Repair and entry rules",
      body: "Clauses shifting all repairs to the tenant, or allowing entry without notice, deserve a second look.",
    },
  ],
  faqs: [
    {
      q: "Can a lease clause override tenant protections in my state?",
      a: "Often no. Many jurisdictions void lease terms that waive basic tenant rights, even if you signed. Rules vary by location, so check your local tenant law.",
    },
    {
      q: "Is it safe to paste my lease here?",
      a: "Paste only the clause you need explained and remove names and addresses. Read our privacy page for how text is processed.",
    },
    {
      q: "Does this replace a lawyer or tenant union?",
      a: "No. It gives general information to help you ask better questions. For a dispute, contact a licensed attorney or a local tenant rights organization.",
    },
  ],
  related: [
    { href: "/tools/notice-period-calculator", label: "Notice period calculator" },
    { href: "/tools/deposit-deduction-checker", label: "Deposit deduction checker" },
    { href: "/blog/auto-renewal-clauses-in-leases", label: "Guide: auto-renewal clauses" },
  ],
};

export const metadata: Metadata = {
  title: "Rental Lease Scanner: Find Red-Flag Clauses",
  description:
    "Paste a lease clause and get a plain-English explanation and risk flags for deposits, auto-renewal, late fees and repairs. Free.",
  alternates: { canonical: content.path },
};

export default function Page() {
  return <NicheLanding c={content} />;
}
