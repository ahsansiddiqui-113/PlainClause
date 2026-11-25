import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeClauseOrDoc, MAX_SNIPPET_CHARS } from "@/lib/ai/analyze";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { findDuplicate, hashSource, saveSnippetDocument } from "@/lib/vault";

export const maxDuration = 30;

const DAILY_IMPORT_LIMIT = 10;
const bodySchema = z.object({ text: z.string().trim().min(20).max(MAX_SNIPPET_CHARS) });

/**
 * Imports an anonymous scan into the signed-in user's vault.
 * The client only supplies the original text; the analysis is re-run on the server
 * so a stored result can never be forged, and the full negotiation email is saved.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to save to your vault." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Saved text must be between 20 and ${MAX_SNIPPET_CHARS} characters.` },
      { status: 400 },
    );
  }
  const text = parsed.data.text;

  // Idempotent: importing the same text twice (refresh, double click) returns the first copy.
  const existing = await findDuplicate(user.id, hashSource(text));
  if (existing) return NextResponse.json({ id: existing.id, duplicate: true });

  const limit = await checkRateLimit(`vault-import:user:${user.id}`, DAILY_IMPORT_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Daily save limit reached. Try again tomorrow." }, { status: 429 });
  }

  try {
    const analysis = await analyzeClauseOrDoc(text, "snippet");
    const id = await saveSnippetDocument(user.id, text, analysis);
    return NextResponse.json({ id, duplicate: false }, { status: 201 });
  } catch (err) {
    console.error("vault import failure", err);
    return NextResponse.json({ error: "Could not save your scan. Please try again." }, { status: 502 });
  }
}
