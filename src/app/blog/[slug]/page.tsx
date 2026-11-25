import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArticlePaywall } from "@/components/blog/article-paywall";
import { ClauseScanner } from "@/components/tools/clause-scanner";
import { faqJsonLd, JsonLd } from "@/components/seo/json-ld";
import { extractFaqs, getAllPosts, getGatedRemainder, getPostForReader } from "@/lib/posts";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";
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
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: "article",
      publishedTime: post.meta.date || undefined,
      url: `/blog/${slug}`,
    },
  };
}

function ArticleSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="h-10 w-3/4 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-5/6 rounded bg-muted" />
    </div>
  );
}

/**
 * Pro-only remainder. Rendered per request (it reads the session), so the gated
 * text is never part of the prerendered static shell. Non-Pro readers get the paywall.
 */
async function ProRemainder({ slug }: { slug: string }) {
  const user = await getCurrentUser();
  if (user?.plan === "pro") {
    const rest = getGatedRemainder(slug);
    if (rest) return <MDXRemote source={rest} components={components} />;
    return null;
  }
  return <ArticlePaywall hasPreview />;
}

async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Public view only: free posts in full, premium posts up to the paywall marker.
  const post = getPostForReader(slug, false);
  if (!post) notFound();

  const faqs = extractFaqs(post.source);
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.meta.title,
      description: post.meta.description,
      datePublished: post.meta.date || undefined,
      mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      isAccessibleForFree: !post.meta.isPremium,
    },
  ];
  if (faqs.length) jsonLd.push(faqJsonLd(faqs));

  return (
    <>
      <JsonLd data={jsonLd} />
      <article>
        <header className="mb-8 space-y-4 border-b pb-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
              {post.meta.category}
            </span>
            <time dateTime={post.meta.date} className="text-muted-foreground">
              {post.meta.date}
            </time>
            {post.meta.isPremium && (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Pro
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.meta.title}</h1>
          <p className="text-lg text-muted-foreground">{post.meta.description}</p>
        </header>
        <div className="prose prose-neutral max-w-none prose-headings:tracking-tight md:prose-lg dark:prose-invert">
          {post.source && <MDXRemote source={post.source} components={components} />}
          {post.gated && (
            <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/60" aria-hidden />}>
              <ProRemainder slug={slug} />
            </Suspense>
          )}
        </div>
      </article>
    </>
  );
}

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Suspense fallback={<ArticleSkeleton />}>
        <Article params={params} />
      </Suspense>
      <p className="mt-10 text-xs text-muted-foreground">
        Informational and educational content only. Not legal advice.
      </p>
    </main>
  );
}
