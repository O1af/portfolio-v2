import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import os from "node:os";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import * as _jsx_runtime from "react/jsx-runtime";
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
    imageOrientation: z.enum(["landscape", "portrait"]).default("landscape"),
    content: z.string(),
  }),
  transform: async (document, context) => {
    // Render MDX to static HTML here (Node) instead of shipping compiled MDX
    // code: evaluating it at request time needs `new Function`, which the
    // Cloudflare Workers runtime forbids — it broke SSR of post bodies.
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
      ],
    });
    const scope = { React, ReactDOM, _jsx_runtime };
    const MDXComponent = new Function(...Object.keys(scope), mdx)(
      ...Object.values(scope)
    ).default;
    const html = renderToStaticMarkup(React.createElement(MDXComponent));
    const slug = document._meta.path;
    return {
      ...document,
      html,
      slug,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
