/** Plan limits for full-document scanning. Server-enforced; the UI only mirrors them. */
export const FREE_FULL_DOC_SCANS = 1; // lifetime
export const FREE_DOC_MAX_PAGES = 3;
export const PRO_DOC_MAX_PAGES = 25;
// Vercel rejects request bodies over ~4.5 MB, so cap just below that.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const DAILY_DOC_SCAN_LIMIT = 30; // cost guard for Pro users
