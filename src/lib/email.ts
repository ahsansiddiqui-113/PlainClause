import "server-only";

export function emailConfigured() {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

/**
 * Can we reliably email ANY user? Resend's shared test sender (onboarding@resend.dev) only delivers
 * to the Resend account owner's own address, so until a sending domain is verified, mail to anyone
 * else silently fails. Requiring email verification in that state would lock every new user out.
 */
export function canEmailAnyone() {
  const from = process.env.EMAIL_FROM ?? "";
  return emailConfigured() && !/@resend\.dev\b/i.test(from);
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Sends one email through Resend's REST API. Never throws; returns whether it was accepted. */
export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }) {
  if (!emailConfigured()) return { ok: false as const, error: "Email is not configured" };
  const base = process.env.RESEND_API_URL ?? "https://api.resend.com";
  try {
    const res = await fetch(`${base}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
    });
    if (!res.ok) {
      console.error("resend failed", res.status, await res.text().catch(() => ""));
      return { ok: false as const, error: `Resend ${res.status}` };
    }
    return { ok: true as const };
  } catch (e) {
    console.error("resend error", e);
    return { ok: false as const, error: "Network error" };
  }
}

/** Minimal, client-safe transactional layout (inline styles only). */
export function emailLayout(title: string, bodyHtml: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#14213d">
<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>${bodyHtml}
<p style="margin-top:32px;font-size:12px;color:#6b7280">PlainClause provides general information, not legal advice.</p></div>`;
}
