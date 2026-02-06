import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import os from "node:os";
import { z } from "zod";

// for more information on configuration, visit:
// https://www.content-collections.dev/docs/configuration

// Some sandboxed environments report zero CPUs, which breaks content-collections
// internal concurrency (`p-limit` requires >= 1).
if (os.cpus().length === 0) {
  const fallbackCpu = {
    model: "virtual",
    speed: 0,
    times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 },
  };
  Object.defineProperty(os, "cpus", {
    value: () => [fallbackCpu],
    configurable: true,
  });
}

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    image: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    const slug = document._meta.path;
    return {
      ...document,
      mdx,
      slug,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
