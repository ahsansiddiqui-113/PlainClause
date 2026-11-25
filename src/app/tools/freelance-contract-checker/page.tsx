import type { Metadata } from "next";
import { NicheLanding, type NicheContent } from "@/components/seo/niche-landing";

const content: NicheContent = {
  path: "/tools/freelance-contract-checker",
  h1: "Freelance Contract Checker: Catch Scope Creep and Payment Traps",
  intro:
    "Paste a clause from a client agreement and see what it really commits you to: unlimited revisions, late payment terms, IP ownership and more.",
  presetText:
    "Contractor shall provide unlimited revisions until Client is satisfied. Payment is due within 90 days after Client's acceptance of the final deliverable. All work product, including pre-existing materials used in the project, shall be the exclusive property of Client.",
  lookFor: [
    {
      title: "Unlimited revisions and vague scope",
      body: "Without a defined number of revisions or a change-order process, extra work becomes free work.",
    },
    {
      title: "Payment timing and acceptance",
      body: "Payment tied to the client's acceptance, with no deadline, lets a client delay payment indefinitely. Look for net-60 or net-90 terms.",
    },
    {
      title: "IP ownership and pre-existing work",
      body: "Make sure the transfer of rights only covers deliverables you were paid for, not tools or code you owned before the project.",
    },
    {
      title: "Non-compete and exclusivity",
      body: "Broad restrictions can block you from working in your field or with other clients.",
    },
    {
      title: "Kill fees and termination",
      body: "If the client can cancel at any time without paying for completed work, you carry all the risk.",
    },
  ],
  faqs: [
    {
      q: "What is a reasonable payment term for freelancers?",
      a: "Net 15 to net 30 is common. Longer terms are negotiable, and you can ask for a deposit or milestone payments.",
    },
    {
      q: "Who owns the work I create as a freelancer?",
      a: "It depends on the contract. Unless you assign rights in writing, freelancers usually keep copyright in many places, so read any assignment or work-for-hire language closely.",
    },
    {
      q: "Can I negotiate a client contract?",
      a: "Yes. Most clients expect edits. Pro members get a ready-to-send negotiation email for the specific clauses flagged.",
    },
  ],
  related: [
    { href: "/tools/job-offer-red-flags", label: "Job offer red flags" },
    { href: "/tools/clause-scanner", label: "General clause scanner" },
    { href: "/blog", label: "All guides" },
  ],
};

export const metadata: Metadata = {
  title: "Freelance Contract Checker: Scope Creep & Late Payment Clauses",
  description:
    "Paste a freelance or client contract clause to spot unlimited revisions, slow payment terms and IP traps in plain English. Free.",
  alternates: { canonical: content.path },
};

export default function Page() {
  return <NicheLanding c={content} />;
}
