import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
export const PAYWALL_MARKER = "{/* PAYWALL_BREAK */}";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  isPremium: boolean;
};

function readPost(slug: string) {
  const file = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const meta: PostMeta = {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    category: String(data.category ?? "Guides"),
    isPremium: data.isPremium === true,
  };
  return { meta, content };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readPost(f.replace(/\.mdx$/, ""))!.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Returns the MDX source that is safe to send to this reader.
 * The cut happens on the raw source BEFORE compilation, so gated text never
 * reaches the RSC payload or page HTML for non-Pro readers.
 */
export function getPostForReader(slug: string, canReadPremium: boolean) {
  const post = readPost(slug);
  if (!post) return null;
  const idx = post.content.indexOf(PAYWALL_MARKER);

  if (!post.meta.isPremium || canReadPremium) {
    const source = idx === -1 ? post.content : post.content.replace(PAYWALL_MARKER, "");
    return { meta: post.meta, source, gated: false };
  }
  // Premium post, non-Pro reader: preview only. With no marker, send nothing.
  const source = idx === -1 ? "" : post.content.slice(0, idx);
  return { meta: post.meta, source, gated: true };
}

/**
 * Pulls Q&A pairs from a "Frequently asked questions" section ("### Question" + paragraph).
 * Call it only on reader-visible source so gated text never reaches structured data.
 */
export function extractFaqs(source: string): { q: string; a: string }[] {
  const m = /^##\s+Frequently asked questions\s*$/im.exec(source);
  if (!m) return [];
  const section = source.slice(m.index + m[0].length).split(/^##\s/m)[0];
  return section
    .split(/^###\s+/m)
    .slice(1)
    .map((block) => {
      const [q, ...rest] = block.split("\n");
      return { q: q.trim(), a: rest.join(" ").replace(/\s+/g, " ").trim() };
    })
    .filter((f) => f.q && f.a);
}
