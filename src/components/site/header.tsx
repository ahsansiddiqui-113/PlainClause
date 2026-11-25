import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { UserMenu } from "@/components/site/user-menu";

const links = [
  { href: "/tools/clause-scanner", label: "Clause Scanner" },
  { href: "/tools/notice-period-calculator", label: "Notice Calculator" },
  { href: "/tools/deposit-deduction-checker", label: "Deposit Checker" },
  { href: "/blog", label: "Guides" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <ShieldCheck className="size-5" aria-hidden />
      </span>
      PlainClause
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <UserMenu />
          <Link href="/tools/clause-scanner" className={buttonClass({ size: "default" })}>
            Scan free
          </Link>
          {/* No-JS mobile menu */}
          <details className="group relative md:hidden">
            <summary
              aria-label="Open menu"
              className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border hover:bg-accent [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-12 z-50 w-56 rounded-xl border bg-background p-2 shadow-lg"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

const toolLinks = [
  { href: "/tools/clause-scanner", label: "Clause scanner" },
  { href: "/tools/rental-lease-scanner", label: "Rental lease scanner" },
  { href: "/tools/freelance-contract-checker", label: "Freelance contract checker" },
  { href: "/tools/job-offer-red-flags", label: "Job offer red flags" },
  { href: "/tools/notice-period-calculator", label: "Notice period calculator" },
  { href: "/tools/deposit-deduction-checker", label: "Deposit deduction checker" },
];
const companyLinks = [
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
];

function FooterCol({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="text-muted-foreground hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Contract fine print in plain English. Free tools to help you understand what you are
            about to sign.
          </p>
        </div>
        <FooterCol title="Tools" items={toolLinks} />
        <FooterCol title="Company" items={companyLinks} />
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted-foreground sm:px-6">
          PlainClause is an informational and educational tool only. It is not a law firm and is not
          a substitute for licensed legal counsel.
        </p>
      </div>
    </footer>
  );
}
