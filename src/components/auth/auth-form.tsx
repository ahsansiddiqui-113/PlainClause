"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { safeNext } from "@/lib/safe-next";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === "signup"
          ? await authClient.signUp.email({ name: name.trim() || email.split("@")[0], email, password })
          : await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Something went wrong. Please try again.");
        return;
      }
      // With email verification on, sign-up succeeds but returns no session until the link is clicked.
      if (mode === "signup" && !(res.data as { token?: string | null } | null)?.token) {
        setCheckEmail(true);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setError(null);
    const res = await authClient.signIn.social({ provider: "google", callbackURL: next });
    if (res?.error) setError(res.error.message ?? "Google sign-in is unavailable.");
  }

  if (checkEmail) {
    return (
      <Alert>
        <AlertDescription>
          <strong>Check your inbox.</strong> We sent a confirmation link to {email}. Click it to finish creating your
          account, then sign in. The link may take a minute to arrive; check spam too.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Sign in or create account" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === m ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {googleEnabled && (
        <>
          <Button type="button" variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or use email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && <p className="text-xs text-muted-foreground">At least 8 characters.</p>}
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
