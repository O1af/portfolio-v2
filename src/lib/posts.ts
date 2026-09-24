// Server-only: full post bodies live here. Routes reach them through the
// server functions in posts-api.ts so post HTML never ships in client JS.
import { allPosts } from "content-collections";
import { comparePublishedDatesDesc } from "@/lib/date";
import { countWords, estimateReadingMinutes } from "@/lib/reading-time";

export const sortedPosts = [...allPosts].sort((a, b) => comparePublishedDatesDesc(a.date, b.date));

type Post = (typeof allPosts)[number];

export type PostSummary = Pick<Post, "slug" | "title" | "summary" | "date" | "author" | "image" | "keywords"> & {
  readingMinutes: number;
};

export type PostPage = {
  post: PostSummary & Pick<Post, "html" | "imageOrientation">;
  wordCount: number;
  next?: { slug: string; title: string };
};

const summarize = (post: Post): PostSummary => ({
  slug: post.slug,
  title: post.title,
  summary: post.summary,
  date: post.date,
  author: post.author,
  image: post.image,
  keywords: post.keywords,
  readingMinutes: estimateReadingMinutes(post.content),
});

export const postSummaries: PostSummary[] = sortedPosts.map(summarize);

export function postPage(slug: string): PostPage | undefined {
  const index = sortedPosts.findIndex((p) => p.slug === slug);
  if (index < 0) return undefined;
  const post = sortedPosts[index];
  const next = sortedPosts[index + 1];
  return {
    post: { ...summarize(post), html: post.html, imageOrientation: post.imageOrientation },
    wordCount: countWords(post.content),
    next: next && { slug: next.slug, title: next.title },
  };
}
