import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro";
  fullDocScansUsed: number;
} | null;

/**
 * Reads the signed-in user from the session cookie.
 * Uses request headers, so with Cache Components it must be called inside a
 * <Suspense> boundary (never from prerendered/cached code).
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, email, name } = session.user;
  const plan = (session.user as { plan?: string }).plan === "pro" ? "pro" : "free";
  const used = Number((session.user as { fullDocScansUsed?: number }).fullDocScansUsed ?? 0);
  return { id, email, name, plan, fullDocScansUsed: used };
}
