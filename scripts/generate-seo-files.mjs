import { promises as fs } from "node:fs";
import path from "node:path";

const siteUrl = process.env.SITE_URL?.trim().replace(/\/+$/, "") ?? "";
const absolute = (pathname) => (siteUrl ? `${siteUrl}${pathname}` : pathname);

const postsDir = path.resolve("content/posts");
const publicDir = path.resolve("public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const llmsPath = path.join(publicDir, "llms.txt");
const robotsPath = path.join(publicDir, "robots.txt");

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

    posts.push({
      slug,
      title: frontmatter.title ?? slug,
      date: toIsoDate(frontmatter.date, now),
      url: absolute(`/blog/${slug}`),
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

function renderSitemap(posts) {
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
  ];

  const postUrls = posts.map((post) => ({
    loc: post.url,
    lastmod: post.date,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const all = [...baseUrls, ...postUrls];
  const lines = all.map(
    (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join("\n")}
</urlset>
`;
}

function renderLlmsTxt(posts) {
  const postLines = posts.map((post) => `- ${post.url} (${post.title})`).join("\n");

  return `# Olaf Dsouza

Personal website and blog for Olaf Dsouza, software engineer.

Site: ${siteUrl || "/"}
Sitemap: ${absolute("/sitemap.xml")}
Contact: mailto:site@olafdsouza.com

## Primary Pages
- ${absolute("/")}
- ${absolute("/blog")}

## Blog Posts
${postLines}
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
  const posts = await getPosts();
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(sitemapPath, renderSitemap(posts), "utf8");
  await fs.writeFile(llmsPath, renderLlmsTxt(posts), "utf8");
  await fs.writeFile(robotsPath, renderRobotsTxt(), "utf8");
  console.log(
    `Generated ${path.relative(process.cwd(), sitemapPath)}, ${path.relative(process.cwd(), llmsPath)}, and ${path.relative(process.cwd(), robotsPath)}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
