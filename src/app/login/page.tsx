import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <section className="relative isolate hidden overflow-hidden bg-[oklch(0.2_0.06_262)] p-14 text-white lg:flex lg:flex-col lg:justify-center xl:p-20">
        <div className="bg-grid-dark absolute inset-0 -z-10" aria-hidden />
        <div className="animate-float-slow absolute -right-32 -top-32 -z-10 size-[30rem] rounded-full bg-sky-500/25 blur-3xl" aria-hidden />
        <ShieldCheck className="size-14 text-sky-300" aria-hidden />
        <h1 className="mt-8 max-w-xl text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
          Keep every contract in one place.
        </h1>
        <p className="mt-5 max-w-lg text-xl text-white/75">
          Save scans to your vault and get a clear plain-English summary whenever you need it.
        </p>
        <ul className="mt-10 space-y-4 text-lg">
          {[
            "Save any scan to your private vault",
            "Upload whole PDFs and Word documents",
            "Reminders before notice deadlines (Pro)",
          ].map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-sky-400/20 text-sky-300">
                <Check className="size-4" aria-hidden />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-lg">
          <div className="pb-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome to PlainClause</h2>
            <p className="mt-2 text-lg text-muted-foreground">Sign in or create a free account.</p>
          </div>
          <div className="rounded-3xl border bg-card p-7 shadow-sm sm:p-8">
            <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-muted/60" aria-hidden />}>
              <AuthForm />
            </Suspense>
          </div>
          <p className="pt-5 text-center text-sm text-muted-foreground">
            By continuing you agree to our{" "}
            <Link href="/legal/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
