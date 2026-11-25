import type { Metadata } from "next";
import { NicheLanding, type NicheContent } from "@/components/seo/niche-landing";

const content: NicheContent = {
  path: "/tools/job-offer-red-flags",
  h1: "Job Offer Red Flags: Check Your Employment Contract Clauses",
  intro:
    "Paste a clause from your offer letter or employment agreement and see what non-competes, clawbacks and IP assignments could mean for your next job.",
  presetText:
    "Employee agrees not to engage in any business similar to the Company's for a period of 24 months after termination anywhere in the United States. Employee shall repay all signing bonuses and training costs if employment ends for any reason within 36 months.",
  lookFor: [
    {
      title: "Non-compete scope and length",
      body: "Broad geography, long duration and vague definitions of competing work are common warning signs. Enforceability varies a lot by location.",
    },
    {
      title: "Bonus and training clawbacks",
      body: "Repayment clauses that apply even if you are laid off, or that last for years, can turn a bonus into a debt.",
    },
    {
      title: "Invention and IP assignment",
      body: "Clauses claiming everything you create, even outside work hours, may reach side projects.",
    },
    {
      title: "At-will, arbitration and pay terms",
      body: "Check for forced arbitration, unpaid overtime language and commissions that can change at the employer's discretion.",
    },
  ],
  faqs: [
    {
      q: "Are non-compete clauses enforceable?",
      a: "It depends on where you work. Some places ban or heavily limit them and others enforce reasonable ones. A local employment lawyer can tell you where you stand.",
    },
    {
      q: "Can I negotiate an offer after receiving it?",
      a: "Yes. Employers expect it. Asking to narrow a non-compete or shorten a clawback period is common and usually polite and professional.",
    },
    {
      q: "Is this legal advice about my employment contract?",
      a: "No. It is a general-information tool that helps you understand the language before you sign.",
    },
  ],
  related: [
    { href: "/tools/freelance-contract-checker", label: "Freelance contract checker" },
    { href: "/tools/clause-scanner", label: "General clause scanner" },
    { href: "/blog", label: "All guides" },
  ],
};

export const metadata: Metadata = {
  title: "Job Offer Red Flags: Non-Compete & Clawback Clause Checker",
  description:
    "Paste a job offer or employment contract clause to understand non-competes, clawbacks and IP assignments in plain English. Free.",
  alternates: { canonical: content.path },
};

export default function Page() {
  return <NicheLanding c={content} />;
}
