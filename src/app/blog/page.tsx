import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllPosts, type PostMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Contract & Lease Guides",
  description: "Plain-English guides to lease clauses, freelance contracts, job offers and other fine print.",
  alternates: { canonical: "/blog" },
};

function PostCard({ p }: { p: PostMeta }) {
  return (
    <Link
      href={`/blog/${p.slug}`}
      className="flex flex-col rounded-xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-primary">{p.category}</span>
        {p.isPremium && <Badge variant="secondary">Pro</Badge>}
      </div>
      <h3 className="mt-2 text-lg font-semibold leading-snug">{p.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
    </Link>
  );
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const free = posts.filter((p) => !p.isPremium);
  const premium = posts.filter((p) => p.isPremium);
  return (
    <main className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contract &amp; Lease Guides</h1>
        <p className="text-lg text-muted-foreground">
          Plain-English explanations of the clauses that most often cost people money, with real
          examples and what to ask for instead.
        </p>
      </header>

      <section aria-labelledby="free" className="space-y-5">
        <h2 id="free" className="text-xl font-semibold">
          Free guides
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {free.map((p) => (
            <PostCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {premium.length > 0 && (
        <section aria-labelledby="playbooks" className="space-y-5">
          <div>
            <h2 id="playbooks" className="text-xl font-semibold">
              Negotiation playbooks
            </h2>
            <p className="text-sm text-muted-foreground">
              Step-by-step plans with word-for-word scripts. Previews are free; the full playbooks are for Pro members.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {premium.map((p) => (
              <PostCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
