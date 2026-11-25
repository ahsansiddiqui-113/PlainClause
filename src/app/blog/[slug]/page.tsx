import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArticlePaywall } from "@/components/blog/article-paywall";
import { ClauseScanner } from "@/components/tools/clause-scanner";
import { getAllPosts, getPostForReader } from "@/lib/posts";
import { getCurrentUser } from "@/lib/session";

const components = { ClauseScanner, ArticlePaywall };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Metadata only uses author-written frontmatter, never gated body text.
  const post = getPostForReader(slug, false);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: { title: post.meta.title, description: post.meta.description, type: "article" },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Reading the user makes this render per-request once auth reads cookies,
  // so Pro-only content is never cached into a shared static page.
  const user = await getCurrentUser();
  const post = getPostForReader(slug, user?.plan === "pro");
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="not-prose text-sm text-muted-foreground">
          {post.meta.category} · <time dateTime={post.meta.date}>{post.meta.date}</time>
        </p>
        <h1>{post.meta.title}</h1>
        {post.source && <MDXRemote source={post.source} components={components} />}
        {post.gated && <ArticlePaywall hasPreview={Boolean(post.source)} />}
      </article>
      <p className="mt-10 text-xs text-muted-foreground">
        Informational and educational content only. Not legal advice.
      </p>
    </main>
  );
}
