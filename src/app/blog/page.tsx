import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Contract & Lease Guides",
  description: "Plain-English guides to lease clauses, freelance contracts, job offers and other fine print.",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-bold">Contract &amp; Lease Guides</h1>
      <ul className="space-y-6">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="block space-y-1 hover:opacity-80">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{p.category}</span>
                <span>·</span>
                <time dateTime={p.date}>{p.date}</time>
                {p.isPremium && <Badge variant="secondary">Pro</Badge>}
              </div>
              <h2 className="text-xl font-semibold">{p.title}</h2>
              <p className="text-muted-foreground">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
