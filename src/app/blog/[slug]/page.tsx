import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { Wrap } from "@/components/site/wrap";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArticlePaywall } from "@/components/blog/article-paywall";
import { ClauseScanner } from "@/components/tools/clause-scanner";
import { faqJsonLd, JsonLd } from "@/components/seo/json-ld";
import { AdSlot } from "@/components/ads/ad-slot";
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

  const related = getAllPosts().filter((p) => p.slug !== slug && p.category === post.meta.category).slice(0, 3);
  const more = related.length ? related : getAllPosts().filter((p) => p.slug !== slug && !p.isPremium).slice(0, 3);

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-16">
      <JsonLd data={jsonLd} />
      <article className="min-w-0">
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
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{post.meta.title}</h1>
          <p className="text-xl text-muted-foreground sm:text-2xl">{post.meta.description}</p>
        </header>
        <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-lg dark:prose-invert xl:prose-xl">
          {post.source && <MDXRemote source={post.source} components={components} />}
          {post.gated && (
            <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted/60" aria-hidden />}>
              <ProRemainder slug={slug} />
            </Suspense>
          )}
          <AdSlot name="inline" className="not-prose mt-10" />
        </div>
      </article>
      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <div className="relative isolate overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground">
          <div className="bg-grid-dark absolute inset-0 -z-10 opacity-60" aria-hidden />
          <h2 className="text-2xl font-bold">Got a clause like this?</h2>
          <p className="mt-2 text-lg text-primary-foreground/85">Paste it into the free scanner and see what it means in plain English.</p>
          <Link href="/tools/clause-scanner" className="mt-5 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-lg font-semibold text-primary transition-transform hover:-translate-y-0.5">
            Scan a clause <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
        {more.length > 0 && (
          <div className="rounded-3xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Keep reading</h2>
            <ul className="mt-3 space-y-1">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="block rounded-xl px-3 py-3 text-base font-medium leading-snug transition-colors hover:bg-accent">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <AdSlot name="sidebar" />
        <p className="px-1 text-sm text-muted-foreground">Informational and educational content only. Not legal advice.</p>
      </aside>
    </div>
  );
}

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main>
      <Wrap className="py-12 lg:py-16">
        <Suspense fallback={<ArticleSkeleton />}>
          <Article params={params} />
        </Suspense>
      </Wrap>
    </main>
  );
}
