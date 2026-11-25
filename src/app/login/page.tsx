import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="space-y-2 pb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome to PlainClause</h1>
        <p className="text-sm text-muted-foreground">
          Save scans to your vault and get deadline reminders.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted/60" aria-hidden />}>
          <AuthForm />
        </Suspense>
      </div>
      <p className="pt-4 text-center text-xs text-muted-foreground">
        By continuing you agree to our <a href="/legal/terms" className="underline">Terms</a> and{" "}
        <a href="/legal/privacy" className="underline">Privacy Policy</a>.
      </p>
    </main>
  );
}
