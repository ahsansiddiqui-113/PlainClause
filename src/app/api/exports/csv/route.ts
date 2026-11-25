import { NextResponse } from "next/server";
import { toCsv } from "@/lib/exports";
import { getCurrentUser } from "@/lib/session";
import { listDocumentsFull } from "@/lib/vault";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (user.plan !== "pro") {
    return NextResponse.json({ error: "Exports are a Pro feature.", code: "upgrade_required" }, { status: 403 });
  }
  const csv = toCsv(await listDocumentsFull(user.id));
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="plainclause-obligations-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
