/**
 * PlainClause mark: a contract page with one clause highlighted, i.e. "the fine print, made plain".
 * Solid fills and basic shapes only so the same SVG renders in the header and in ImageResponse icons.
 */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#1e3a8a" />
      <path d="M19 10h19l11 11v31a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" fill="#ffffff" />
      <path d="M38 10l11 11H41a3 3 0 0 1-3-3z" fill="#c7d2fe" />
      <rect x="22" y="25" width="17" height="3.5" rx="1.75" fill="#94a3b8" />
      <rect x="19.5" y="32" width="25" height="9" rx="2.5" fill="#fbbf24" />
      <rect x="23" y="35.2" width="18" height="2.6" rx="1.3" fill="#1e3a8a" />
      <rect x="22" y="45" width="14" height="3.5" rx="1.75" fill="#94a3b8" />
    </svg>
  );
}
