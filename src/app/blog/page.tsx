import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Wrap } from "@/components/site/wrap";
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
      className="group flex flex-col rounded-3xl border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground">{p.category}</span>
        {p.isPremium && <Badge className="h-auto px-2.5 py-1">Pro</Badge>}
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-snug group-hover:text-primary">{p.title}</h3>
      <p className="mt-3 flex-1 text-base text-muted-foreground">{p.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-primary">
        Read <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const free = posts.filter((p) => !p.isPremium);
  const premium = posts.filter((p) => p.isPremium);
  const categories = [...new Set(posts.map((p) => p.category))];
  return (
    <main>
      <section className="relative isolate overflow-hidden border-b bg-muted/40">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="absolute -left-24 -top-24 -z-10 size-[26rem] rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <Wrap className="py-14 lg:py-20">
          <h1 className="max-w-5xl text-5xl font-extrabold leading-[1.03] tracking-tight sm:text-6xl">
            Contract &amp; lease guides
          </h1>
          <p className="mt-5 max-w-3xl text-xl text-muted-foreground sm:text-2xl">
            Plain-English explanations of the clauses that most often cost people money, with real examples and what
            to ask for instead.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3" aria-label="Topics">
            {categories.map((c) => (
              <li key={c} className="rounded-full border bg-background px-4 py-1.5 text-base font-medium">
                {c}
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      <Wrap className="space-y-16 py-14 lg:py-20">
        <section aria-labelledby="free" className="space-y-7">
          <h2 id="free" className="text-3xl font-bold tracking-tight">
            Free guides
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {free.map((p) => (
              <PostCard key={p.slug} p={p} />
            ))}
          </div>
        </section>

        {premium.length > 0 && (
          <section aria-labelledby="playbooks" className="rounded-[2rem] bg-accent/50 p-6 sm:p-10">
            <h2 id="playbooks" className="text-3xl font-bold tracking-tight">
              Negotiation playbooks
            </h2>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              Step-by-step plans with word-for-word scripts. Previews are free; the full playbooks are for Pro members.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {premium.map((p) => (
                <PostCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        )}
      </Wrap>
    </main>
  );
}
