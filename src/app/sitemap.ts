import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { absoluteUrl, STATIC_ROUTES } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));
  // Premium posts are included: their free preview is public and indexable.
  const posts = getAllPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.date ? new Date(p.date) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...posts];
}
