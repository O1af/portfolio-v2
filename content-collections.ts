import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
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

type MdxContext = Parameters<typeof compileMDX>[0];
type MdxDocument = Parameters<typeof compileMDX>[1];

// Render MDX to static HTML here (Node) instead of shipping compiled MDX
// code: evaluating it at request time needs `new Function`, which the
// Cloudflare Workers runtime forbids — it broke SSR of post bodies.
async function renderToHtml(context: MdxContext, document: MdxDocument) {
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
  return renderToStaticMarkup(React.createElement(MDXComponent));
}

/** Last commit date of a content file (CI checks out full history), if it has one. */
function gitDate(directory: string, filePath: string): string | undefined {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", path.join(directory, filePath)], {
      encoding: "utf8",
    }).trim();
    return date || undefined;
  } catch {
    return undefined;
  }
}

const isoDay = (date?: Date) => date?.toISOString().slice(0, 10);

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
    keywords: z.array(z.string()).default([]),
    content: z.string(),
  }),
  transform: async (document, context) => ({
    ...document,
    html: await renderToHtml(context, document),
    slug: document._meta.path,
  }),
});

// Hand-written overlays for food places (see content/food/README.md). Plain
// markdown: the body is the published note, kept as text for now.
const foodPlaces = defineCollection({
  name: "foodPlaces",
  directory: "content/food/places",
  include: "*.md",
  schema: z.object({
    id: z.number().int(),
    status: z.enum(["draft", "done", "hidden"]),
    dishes: z
      .array(z.object({ name: z.string(), must_order: z.boolean().default(false) }))
      .optional(),
    updated: z.coerce.date().optional(),
    content: z.string(),
  }),
  transform: (document) => ({
    ...document,
    slug: document._meta.path,
    lastModified: gitDate("content/food/places", document._meta.filePath) ?? isoDay(document.updated),
  }),
});

// Hand-written guides ("Best Mexican in San Jose"). The body is the intro,
// rendered to HTML. See content/food/README.md for the fields.
const foodGuides = defineCollection({
  name: "foodGuides",
  directory: "content/food/guides",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    region: z.string(),
    description: z.string(),
    places: z.array(z.string()).optional(),
    filter: z
      .object({
        category: z.enum(["restaurants", "coffee", "dessert", "bakeries", "bars"]).optional(),
        kind: z.enum(["coffee", "tea"]).optional(),
        cuisines: z.array(z.string()).optional(),
        cities: z.array(z.string()).optional(),
        neighborhoods: z.array(z.string()).optional(),
        min_score: z.number().optional(),
      })
      .optional(),
    limit: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
    updated: z.coerce.date().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => ({
    ...document,
    slug: document._meta.path,
    intro: await renderToHtml(context, document),
    lastModified: gitDate("content/food/guides", document._meta.filePath) ?? isoDay(document.updated),
  }),
});

export default defineConfig({
  collections: [posts, foodPlaces, foodGuides],
});
