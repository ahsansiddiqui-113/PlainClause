import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    href: "/tools/clause-scanner",
    title: "Red-Flag Clause Scanner",
    desc: "Paste a clause from a lease, freelance contract or job offer and get a plain-English translation with risk flags.",
  },
  {
    href: "/tools/notice-period-calculator",
    title: "Notice Period Calculator",
    desc: "Find the last day to give notice before your lease ends or auto-renews, and prorate first-month rent.",
  },
  {
    href: "/tools/deposit-deduction-checker",
    title: "Deposit Deduction Checker",
    desc: "Add up your landlord's itemized deductions and see how much of your deposit you should get back.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-14">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Understand the fine print before you sign it
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Free tools that translate contract language into plain English and flag the clauses that
          can cost you money.
        </p>
        <Link href="/tools/clause-scanner" className={buttonVariants({ size: "lg" })}>
          Scan a clause free
        </Link>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="block">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm font-medium">Open tool →</CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
