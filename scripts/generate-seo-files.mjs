import { promises as fs } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runnerImport } from "vite";

const defaultSiteUrl = "https://olafdsouza.com";
const siteUrl =
  process.env.SITE_URL?.trim().replace(/\/+$/, "") || defaultSiteUrl;
const absolute = (pathname) => (siteUrl ? `${siteUrl}${pathname}` : pathname);

const postsDir = path.resolve("content/posts");
const foodDir = path.resolve("content/food");
const publicDir = path.resolve("public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const llmsPath = path.join(publicDir, "llms.txt");
const robotsPath = path.join(publicDir, "robots.txt");

function splitBody(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split("\n")) {
    const entry = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
    if (!entry) continue;

    const [, key, rawValue] = entry;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return data;
}

function toIsoDate(value, fallback) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 10);
}

function lastModified(fullPath, fallback) {
  try {
    const date = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", fullPath],
      { encoding: "utf8" }
    ).trim();
    return date || fallback;
  } catch {
    return fallback;
  }
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function getPosts() {
  const entries = await fs.readdir(postsDir);
  const files = entries.filter((file) => file.endsWith(".mdx"));
  const now = new Date().toISOString().slice(0, 10);

  const posts = [];
  for (const fileName of files) {
    const slug = fileName.replace(/\.mdx$/, "");
    const fullPath = path.join(postsDir, fileName);
    const raw = await fs.readFile(fullPath, "utf8");
    const frontmatter = parseFrontmatter(raw);

    const date = toIsoDate(frontmatter.date, now);
    posts.push({
      slug,
      title: frontmatter.title ?? slug,
      summary: frontmatter.summary ?? "",
      date,
      lastmod: lastModified(fullPath, date),
      url: absolute(`/blog/${slug}`),
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

async function readMarkdownDir(dir) {
  const entries = await fs.readdir(dir).catch(() => []);
  return Promise.all(
    entries
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const fullPath = path.join(dir, file);
        const raw = await fs.readFile(fullPath, "utf8");
        const data = parseFrontmatter(raw);
        return {
          slug: file.replace(/\.md$/, ""),
          data,
          body: splitBody(raw),
          lastmod: lastModified(fullPath, toIsoDate(data.updated, undefined)),
        };
      })
  );
}

const newest = (dates) => dates.filter(Boolean).sort().at(-1);

/**
 * Food URLs, using the app's own merge and guide rules (loaded through Vite so the
 * TypeScript module is shared rather than copied). Only the URL-level facts are
 * needed here: which places have pages, which guides exist, and when each changed.
 */
async function getFood() {
  const { module: core } = await runnerImport("/src/lib/food-core.ts", { configFile: false, logLevel: "silent" });
  const ratings = JSON.parse(await fs.readFile(path.join(foodDir, "ratings.json"), "utf8"));

  const overlays = new Map(
    (await readMarkdownDir(path.join(foodDir, "places"))).map((doc) => [
      Number(doc.data.id),
      { id: Number(doc.data.id), status: doc.data.status, updated: doc.lastmod, body: doc.body },
    ])
  );
  const places = ratings.places.map((source) => core.mergePlace(source, overlays.get(source.id)));
  const guides = core.buildGuides(places, ratings.regions);
  const regionSlugs = new Set(ratings.regions.map((r) => r.slug));
  const customGuides = (await readMarkdownDir(path.join(foodDir, "guides")))
    .filter((doc) => doc.data.draft !== "true" && regionSlugs.has(doc.data.region))
    .map((doc) => ({
      path: `${doc.data.region}/${doc.slug}`,
      region: doc.data.region,
      label: doc.data.title ?? doc.slug,
      description: doc.data.description ?? "",
      updated: doc.lastmod,
    }));

  const allGuides = [
    ...guides.map((g) => ({
      path: g.path,
      region: g.region.slug,
      label: `${g.title}`,
      description: g.description,
      updated: g.updated,
    })),
    ...customGuides,
  ];
  const regions = ratings.regions
    .filter((r) => allGuides.some((g) => g.region === r.slug))
    .map((r) => ({
      slug: r.slug,
      name: r.name,
      updated: newest(allGuides.filter((g) => g.region === r.slug).map((g) => g.updated)),
    }));
  const pages = places
    .filter((p) => p.hasPage)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      updated: newest([p.edited, p.visited]),
      images: p.photos.map((ph) => core.photoUrl(ph.id, "1200")),
    }));

  return { guides: allGuides, regions, pages, updated: newest(allGuides.map((g) => g.updated)) };
}

function renderSitemap(posts, food) {
  const today = new Date().toISOString().slice(0, 10);
  const baseUrls = [
    {
      loc: absolute("/"),
      lastmod: today,
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: absolute("/blog"),
      lastmod: today,
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      loc: absolute("/connections"),
      lastmod: today,
      changefreq: "monthly",
      priority: "0.6",
    },
  ];

  const postUrls = posts.map((post) => ({
    loc: post.url,
    lastmod: post.lastmod,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const foodUrls = [
    { loc: absolute("/food"), lastmod: food.updated ?? today, changefreq: "weekly", priority: "0.9" },
    ...food.regions.map((r) => ({
      loc: absolute(`/food/${r.slug}`),
      lastmod: r.updated ?? today,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...food.guides.map((g) => ({
      loc: absolute(`/food/${g.path}`),
      lastmod: g.updated ?? today,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...food.pages.map((p) => ({
      loc: absolute(`/food/place/${p.slug}`),
      lastmod: p.updated ?? today,
      changefreq: "monthly",
      priority: "0.6",
      images: p.images,
    })),
  ];

  const all = [...baseUrls, ...postUrls, ...foodUrls];
  const lines = all.map(
    (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>${(entry.images ?? [])
      .map((src) => `\n    <image:image><image:loc>${xmlEscape(src)}</image:loc></image:image>`)
      .join("")}
  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${lines.join("\n")}
</urlset>
`;
}

function renderLlmsTxt(posts, food) {
  const postLines = posts
    .map((post) => `- [${post.title}](${post.url}): ${post.summary}`)
    .join("\n");
  const guideLines = food.guides
    .map((g) => `- [${g.label}](${absolute(`/food/${g.path}`)}): ${g.description}`)
    .join("\n");

  return `# Olaf Dsouza

> Personal site and engineering blog for Olaf Dsouza, a software engineer focused on operating systems, LLMs, and distributed systems.

Olaf is a software engineer at Netflix and a University of Michigan CS/CSE alum who has also worked at August Law and Quail AI. This site hosts his portfolio, experience, and blog.

## Primary Pages
- [Home](${absolute("/")}): Portfolio, experience, and project overview.
- [Blog](${absolute("/blog")}): Writing on operating systems, LLMs, distributed systems, and CS coursework.
- [Food](${absolute("/food")}): Ranked guides to the ${food.pages.length}+ restaurants, coffee shops, bakeries and bars Olaf has rated, with notes and photos.
- [Connections](${absolute("/connections")}): NYT Connections tracking board.

## Blog Posts
${postLines}

## Food Guides
${guideLines}

## Optional
- [Sitemap](${absolute("/sitemap.xml")}): Full XML sitemap of the site.
- Contact: mailto:site@olafdsouza.com
`;
}

function renderRobotsTxt() {
  return `User-agent: *
Disallow:

Sitemap: ${absolute("/sitemap.xml")}
Allow: /llms.txt
`;
}

async function main() {
  const [posts, food] = await Promise.all([getPosts(), getFood()]);
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(sitemapPath, renderSitemap(posts, food), "utf8");
  await fs.writeFile(llmsPath, renderLlmsTxt(posts, food), "utf8");
  await fs.writeFile(robotsPath, renderRobotsTxt(), "utf8");
  console.log(
    `Generated ${path.relative(process.cwd(), sitemapPath)}, ${path.relative(
      process.cwd(),
      llmsPath
    )}, and ${path.relative(process.cwd(), robotsPath)}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
