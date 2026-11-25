import { NextResponse } from "next/server";
import { analyzeClauseOrDoc } from "@/lib/ai/analyze";
import { DocumentError, extractDocumentText } from "@/lib/documents";
import {
  DAILY_DOC_SCAN_LIMIT,
  FREE_DOC_MAX_PAGES,
  FREE_FULL_DOC_SCANS,
  MAX_UPLOAD_BYTES,
  PRO_DOC_MAX_PAGES,
} from "@/lib/plans";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { refundFreeDocScan, reserveFreeDocScan, saveFullDocument } from "@/lib/vault";

export const maxDuration = 60;

function fail(error: string, status: number, code: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, code, ...extra }, { status });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in to scan a document.", 401, "unauthenticated");
  const isPro = user.plan === "pro";

  // Cheap rejection of oversized bodies before buffering the upload.
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) {
    return fail(`File is too large. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`, 413, "too_large");
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return fail("Upload a file using the form.", 400, "bad_request");
  }
  if (!file || file.size === 0) return fail("Choose a PDF or Word (.docx) file to scan.", 400, "no_file");
  if (file.size > MAX_UPLOAD_BYTES) {
    return fail(`File is too large. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`, 413, "too_large");
  }

  const limit = await checkRateLimit(`doc-scan:user:${user.id}`, DAILY_DOC_SCAN_LIMIT);
  if (!limit.allowed) return fail("Daily document scan limit reached. Try again tomorrow.", 429, "rate_limited");

  // 1) Extract. Free users only get the first pages analyzed; Pro gets the whole document.
  let doc;
  try {
    doc = await extractDocumentText(new Uint8Array(await file.arrayBuffer()), {
      maxPages: isPro ? PRO_DOC_MAX_PAGES : FREE_DOC_MAX_PAGES,
      pageCap: PRO_DOC_MAX_PAGES,
    });
  } catch (err) {
    if (err instanceof DocumentError) return fail(err.message, err.status, err.code);
    console.error("document extraction failure", err);
    return fail("We could not read that file.", 422, "unreadable");
  }

  // 2) Plan gate (after extraction, so unreadable files never burn the free scan).
  if (!isPro && !(await reserveFreeDocScan(user.id))) {
    return fail(
      "You have used your free full-document scan. Upgrade to Pro for unlimited multi-page scans and your Contract Vault.",
      402,
      "upgrade_required",
    );
  }

  // 3) Analyze, refunding the free scan if the model call fails.
  let analysis;
  try {
    analysis = await analyzeClauseOrDoc(doc.text, "full_doc");
  } catch (err) {
    console.error("document analysis failure", err);
    if (!isPro) await refundFreeDocScan(user.id).catch(() => {});
    return fail("Analysis failed. Please try again.", 502, "analysis_failed");
  }

  const base = {
    fileName: file.name,
    pagesAnalyzed: doc.pagesRead,
    totalPages: doc.totalPages,
    truncated: doc.truncated,
  };
  const title = file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "Untitled document";

  if (isPro) {
    const id = await saveFullDocument(
      user.id,
      { title, fileName: file.name, pagesRead: doc.pagesRead, totalPages: doc.totalPages },
      analysis,
    );
    return NextResponse.json({ ...base, plan: "pro", saved: true, id, analysis });
  }

  // Free: show the analysis once, withhold the full negotiation email, store nothing.
  const { negotiationCounterScript, ...rest } = analysis;
  return NextResponse.json({
    ...base,
    plan: "free",
    saved: false,
    freeScansRemaining: Math.max(0, FREE_FULL_DOC_SCANS - 1),
    analysis: { ...rest, negotiationTeaser: negotiationCounterScript.slice(0, 140) },
  });
}
