import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { riskTier } from "@/lib/deadlines";
import type { StoredDocument } from "@/lib/vault";

const iso = (d: Date) => d.toISOString().slice(0, 10);

function level(d: StoredDocument): string {
  return d.analysis?.riskLevel ?? { high: "HIGH", medium: "MEDIUM", low: "LOW", none: "" }[riskTier(d.riskScore)];
}

function obligations(d: StoredDocument): string[] {
  return (d.analysis?.extractedDates ?? []).map((x) => {
    const action = x.actionRequired && x.actionRequired.toLowerCase() !== "none" ? ` - ${x.actionRequired}` : "";
    return `${x.label}: ${x.date}${action}`;
  });
}

/**
 * Spreadsheet apps execute cells that start with = + - @ (formula injection).
 * Titles and AI text are untrusted, so prefix those with an apostrophe.
 */
function cell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  s = s.replace(/\r?\n/g, " ");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(docs: StoredDocument[]): string {
  const header = [
    "Title",
    "Type",
    "Risk level",
    "Risk score",
    "Notice deadline",
    "Renewal date",
    "Red flags",
    "Obligations and key dates",
    "Summary",
    "Saved on",
  ];
  const rows = docs.map((d) => [
    d.title,
    d.docType === "document" ? "Document" : "Clause",
    level(d),
    d.riskScore ?? "",
    d.noticeDeadlineDate ?? "",
    d.renewalDate ?? "",
    d.analysis?.redFlags.length ?? 0,
    obligations(d).join("; "),
    d.analysis?.plainEnglishSummary ?? "",
    iso(d.createdAt),
  ]);
  // BOM so Excel reads UTF-8 correctly.
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

// ---------- PDF ----------

/** Standard PDF fonts only encode WinAnsi; swap anything else for "?" instead of throwing. */
function safe(font: PDFFont, input: string): string {
  let out = "";
  for (const ch of input.replace(/\s+/g, " ")) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      out += "?";
    }
  }
  return out;
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  const push = (w: string) => {
    // Break words that are wider than a whole line.
    while (font.widthOfTextAtSize(w, size) > maxWidth) {
      let cut = w.length;
      while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > maxWidth) cut--;
      lines.push(w.slice(0, cut));
      w = w.slice(cut);
    }
    return w;
  };
  for (const word of text.split(" ")) {
    const trial = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = push(word);
    }
  }
  if (line) lines.push(line);
  return lines;
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export async function toPdf(docs: StoredDocument[], opts: { email: string }): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("PlainClause contract obligations summary");
  pdf.setProducer("PlainClause");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28, H = 841.89, M = 50, BOTTOM = 60;
  const maxW = W - M * 2;
  let page: PDFPage = pdf.addPage([W, H]);
  let y = H - M;

  const ensure = (h: number) => {
    if (y - h < BOTTOM) {
      page = pdf.addPage([W, H]);
      y = H - M;
    }
  };
  const text = (s: string, o: { size?: number; bold?: boolean; indent?: number; color?: [number, number, number]; gap?: number } = {}) => {
    const size = o.size ?? 10.5;
    const f = o.bold ? bold : font;
    const indent = o.indent ?? 0;
    for (const l of wrap(f, safe(f, s), size, maxW - indent)) {
      ensure(size + 4);
      y -= size + 3;
      page.drawText(l, { x: M + indent, y, size, font: f, color: rgb(...(o.color ?? [0.1, 0.1, 0.12])) });
    }
    y -= o.gap ?? 0;
  };

  text("PlainClause", { size: 11, bold: true, color: [0.26, 0.31, 0.62] });
  text("Contract obligations summary", { size: 22, bold: true, gap: 4 });
  text(`Generated ${iso(new Date())} for ${opts.email}`, { size: 10, color: [0.4, 0.4, 0.45], gap: 2 });
  const high = docs.filter((d) => riskTier(d.riskScore) === "high").length;
  text(`${docs.length} saved document${docs.length === 1 ? "" : "s"} · ${high} high-risk`, { size: 11, gap: 14 });

  if (docs.length === 0) text("You have no saved documents yet.");

  for (const d of docs) {
    ensure(70);
    page.drawLine({ start: { x: M, y: y - 4 }, end: { x: W - M, y: y - 4 }, thickness: 0.6, color: rgb(0.85, 0.86, 0.9) });
    y -= 10;
    text(d.title, { size: 14, bold: true, gap: 2 });
    const meta = [
      d.docType === "document" ? "Document" : "Clause",
      level(d) ? `Risk ${level(d)}${d.riskScore !== null ? ` (${d.riskScore}/100)` : ""}` : "",
      `Saved ${iso(d.createdAt)}`,
    ].filter(Boolean);
    text(meta.join("  |  "), { size: 10, color: [0.4, 0.4, 0.45], gap: 4 });

    if (d.analysis) {
      text(clip(d.analysis.plainEnglishSummary, 420), { gap: 4 });
      const ob = obligations(d);
      if (ob.length) {
        text("Key dates and obligations", { bold: true, size: 11, gap: 1 });
        for (const o of ob) text(`•  ${o}`, { indent: 10 });
        y -= 3;
      }
      if (d.analysis.redFlags.length) {
        text("Red flags", { bold: true, size: 11, gap: 1 });
        for (const f of d.analysis.redFlags) {
          text(`•  [${f.severity}] "${clip(f.clauseQuote, 170)}"`, { indent: 10, bold: true, size: 10 });
          text(clip(f.whyItMatters, 260), { indent: 22, size: 10, color: [0.3, 0.3, 0.35], gap: 2 });
        }
      }
    } else {
      text("Analysis unavailable for this document.", { color: [0.4, 0.4, 0.45] });
    }
    y -= 12;
  }

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(safe(font, `PlainClause is informational only and not legal advice.   Page ${i + 1} of ${pages.length}`), {
      x: M,
      y: 30,
      size: 8.5,
      font,
      color: rgb(0.5, 0.5, 0.55),
    });
  });
  return pdf.save();
}
