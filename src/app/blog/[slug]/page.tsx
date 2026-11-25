import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArticlePaywall } from "@/components/blog/article-paywall";
import { ClauseScanner } from "@/components/tools/clause-scanner";
import { faqJsonLd, JsonLd } from "@/components/seo/json-ld";
import { extractFaqs, getAllPosts, getPostForReader } from "@/lib/posts";
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Reading the user makes this render per-request once auth reads cookies,
  // so Pro-only content is never cached into a shared static page.
  const user = await getCurrentUser();
  const post = getPostForReader(slug, user?.plan === "pro");
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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
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
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Pro</span>
            )}
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.meta.title}</h1>
          <p className="text-lg text-muted-foreground">{post.meta.description}</p>
        </header>
        <div className="prose prose-neutral max-w-none prose-headings:tracking-tight md:prose-lg dark:prose-invert">
          {post.source && <MDXRemote source={post.source} components={components} />}
          {post.gated && <ArticlePaywall hasPreview={Boolean(post.source)} />}
        </div>
      </article>
      <p className="mt-10 text-xs text-muted-foreground">
        Informational and educational content only. Not legal advice.
      </p>
    </main>
  );
}
