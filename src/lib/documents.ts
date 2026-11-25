import "server-only";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export class DocumentError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}

export type ExtractedDocument = {
  text: string;
  kind: "pdf" | "docx";
  totalPages: number | null; // unknown for DOCX
  pagesRead: number | null;
  truncated: boolean; // true when a plan page limit cut the document short
};

// ~25 pages of dense contract text; DOCX has no reliable page count server-side.
const DOCX_MAX_CHARS = 75_000;
const SCANNED_MESSAGE =
  "This PDF appears to be a scanned image without selectable text. Paste the text into the clause scanner or upload a digital PDF.";

export function detectKind(bytes: Uint8Array): "pdf" | "docx" | null {
  const head = Buffer.from(bytes.subarray(0, 8));
  if (head.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  // DOCX is a ZIP container. Legacy .doc (OLE2, starts D0 CF 11 E0) is not supported.
  if (head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) return "docx";
  return null;
}

function clean(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdf(bytes: Uint8Array, maxPages: number, pageCap: number): Promise<ExtractedDocument> {
  let pdf;
  try {
    pdf = await getDocumentProxy(bytes);
  } catch (err) {
    if (err instanceof Error && err.name === "PasswordException") {
      throw new DocumentError("This PDF is password protected. Remove the password and upload it again.", 422, "encrypted");
    }
    throw new DocumentError("We could not read this PDF. It may be corrupted; try re-saving it as a new PDF.", 422, "unreadable");
  }

  const totalPages = pdf.numPages;
  if (totalPages > pageCap) {
    throw new DocumentError(
      `This document has ${totalPages} pages. The limit is ${pageCap} pages per scan.`,
      422,
      "too_many_pages",
    );
  }

  const { text: pages } = await extractText(pdf, { mergePages: false });
  const read = pages.slice(0, maxPages);
  const text = clean(read.join("\n\n"));

  // Born-digital contracts carry far more than this per page; scans carry ~nothing.
  const letters = text.replace(/[^\p{L}\p{N}]/gu, "").length;
  if (letters < 100 || letters / Math.max(1, read.length) < 40) {
    throw new DocumentError(SCANNED_MESSAGE, 422, "scanned_pdf");
  }

  return { text, kind: "pdf", totalPages, pagesRead: read.length, truncated: totalPages > read.length };
}

async function extractDocx(bytes: Uint8Array): Promise<ExtractedDocument> {
  let value: string;
  try {
    ({ value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) }));
  } catch {
    throw new DocumentError("We could not read this Word file. Make sure it is a .docx document.", 422, "unreadable");
  }
  const text = clean(value);
  if (text.replace(/[^\p{L}\p{N}]/gu, "").length < 100) {
    throw new DocumentError("We could not find enough text in this document to analyze.", 422, "empty");
  }
  if (text.length > DOCX_MAX_CHARS) {
    throw new DocumentError("This document is too long to scan (about 25 pages maximum).", 422, "too_long");
  }
  return { text, kind: "docx", totalPages: null, pagesRead: null, truncated: false };
}

/**
 * @param maxPages pages actually analyzed (plan limit; extra pages are ignored)
 * @param pageCap  documents longer than this are rejected outright
 */
export async function extractDocumentText(
  bytes: Uint8Array,
  opts: { maxPages: number; pageCap: number },
): Promise<ExtractedDocument> {
  const kind = detectKind(bytes);
  if (kind === "pdf") return extractPdf(bytes, opts.maxPages, opts.pageCap);
  if (kind === "docx") return extractDocx(bytes);
  throw new DocumentError("Unsupported file type. Upload a PDF or a Word (.docx) file.", 415, "unsupported_type");
}
