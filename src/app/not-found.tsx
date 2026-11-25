import type { Metadata } from "next";
import Link from "next/link";
import { Wrap } from "@/components/site/wrap";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main>
      <Wrap className="py-24 text-center lg:py-32">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-5 max-w-xl text-xl text-muted-foreground">
          The link may be old or mistyped. Try one of these instead.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tools/clause-scanner" className={buttonClass({ size: "lg" })}>
            Scan a clause
          </Link>
          <Link href="/blog" className={buttonClass({ size: "lg", variant: "outline" })}>
            Read the guides
          </Link>
          <Link href="/" className={buttonClass({ size: "lg", variant: "outline" })}>
            Home
          </Link>
        </div>
      </Wrap>
    </main>
  );
}
