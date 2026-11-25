import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeClauseOrDoc, MAX_SNIPPET_CHARS } from "@/lib/ai/analyze";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export const maxDuration = 30;

const DAILY_LIMIT = 3;
const bodySchema = z.object({ text: z.string().trim().min(20).max(MAX_SNIPPET_CHARS) });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Paste between 20 and ${MAX_SNIPPET_CHARS} characters of contract text.` },
      { status: 400 },
    );
  }

  const ip = clientIp(req.headers);
  let limit;
  try {
    limit = await checkRateLimit(`scan:ip:${ip}`, DAILY_LIMIT);
  } catch (err) {
    console.error("rate limit failure", err);
    const hint =
      process.env.NODE_ENV === "production"
        ? "Service temporarily unavailable."
        : "Database unreachable (dev hint): set a real DATABASE_URL in .env, or use DATABASE_URL=pglite://.pglite for a local database, then restart `npm run dev`.";
    return NextResponse.json({ error: hint }, { status: 503 });
  }
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "You have used your 3 free scans for today. Come back tomorrow or upgrade to Pro." },
      { status: 429 },
    );
  }

  try {
    const analysis = await analyzeClauseOrDoc(parsed.data.text, "snippet");
    // Anonymous users only get a teaser; the full email never leaves the server.
    const { negotiationCounterScript, ...rest } = analysis;
    return NextResponse.json({
      ...rest,
      negotiationTeaser: negotiationCounterScript.slice(0, 140),
      remaining: limit.remaining,
    });
  } catch (err) {
    console.error("analysis failure", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 502 });
  }
}
