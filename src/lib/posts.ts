import { allPosts } from "content-collections";
import { comparePublishedDatesDesc } from "@/lib/date";
import { estimateReadingMinutes } from "@/lib/reading-time";

export const sortedPosts = [...allPosts].sort((a, b) =>
  comparePublishedDatesDesc(a.date, b.date)
);

export const readingMinutesBySlug = new Map(
  allPosts.map((post) => [post.slug, estimateReadingMinutes(post.content)])
);
