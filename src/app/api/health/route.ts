import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";

// For uptime monitors. Reports only ok/not-ok, never configuration details.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
