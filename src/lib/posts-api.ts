import { createServerFn } from "@tanstack/react-start";
import type { PostPage, PostSummary } from "./posts";

export const getPostList = createServerFn({ method: "GET" }).handler(
  async (): Promise<PostSummary[]> => (await import("./posts")).postSummaries
);

export const getPost = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const slug = (data as { slug?: unknown })?.slug;
    if (typeof slug !== "string") throw new Error("slug required");
    return { slug };
  })
  .handler(async ({ data }): Promise<PostPage | null> => (await import("./posts")).postPage(data.slug) ?? null);
