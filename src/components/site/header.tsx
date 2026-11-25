import Link from "next/link";

const links = [
  { href: "/tools/clause-scanner", label: "Clause Scanner" },
  { href: "/tools/notice-period-calculator", label: "Notice Calculator" },
  { href: "/tools/deposit-deduction-checker", label: "Deposit Checker" },
  { href: "/blog", label: "Guides" },
];

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          PlainClause
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-6 text-xs text-muted-foreground">
        <nav aria-label="Scanners by topic" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/tools/rental-lease-scanner" className="hover:text-foreground">
            Rental lease scanner
          </Link>
          <Link href="/tools/freelance-contract-checker" className="hover:text-foreground">
            Freelance contract checker
          </Link>
          <Link href="/tools/job-offer-red-flags" className="hover:text-foreground">
            Job offer red flags
          </Link>
        </nav>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/legal/disclaimer" className="hover:text-foreground">
            Disclaimer
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>
        </nav>
        <p>
          PlainClause is an informational and educational tool only. It is not a law firm and is not
          a substitute for licensed legal counsel.
        </p>
      </div>
    </footer>
  );
}
