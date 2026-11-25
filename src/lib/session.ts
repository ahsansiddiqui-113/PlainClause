export type CurrentUser = { id: string; plan: "free" | "pro" } | null;

/**
 * Placeholder until Better Auth lands on Day 9. Anonymous visitors (null) are
 * treated as non-Pro everywhere, so premium content stays gated.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  return null;
}
