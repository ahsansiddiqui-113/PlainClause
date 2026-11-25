import { NextResponse } from "next/server";
import { toPdf } from "@/lib/exports";
import { getCurrentUser } from "@/lib/session";
import { listDocumentsFull } from "@/lib/vault";

export const maxDuration = 30;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (user.plan !== "pro") {
    return NextResponse.json({ error: "Exports are a Pro feature.", code: "upgrade_required" }, { status: 403 });
  }
  const bytes = await toPdf(await listDocumentsFull(user.id), { email: user.email });
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="plainclause-obligations-${new Date().toISOString().slice(0, 10)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
