import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { deleteDocument } from "@/lib/vault";

const idSchema = z.string().uuid();

/** Permanently deletes one of the signed-in user's saved documents. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Scoped by owner: someone else's document id behaves exactly like a missing one.
  const deleted = await deleteDocument(user.id, id);
  if (!deleted) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
