import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const stateDir = ".indexnow";
const currentPath = `${stateDir}/current.json`;
const previousPath = `${stateDir}/previous.json`;
const sitemapPath = "dist/client/sitemap.xml";
const digest = (value) => createHash("sha256").update(value).digest("hex");

export function sitemapUrls(xml, host) {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  try {
    return [...new Set([...dom.window.document.querySelectorAll("url > loc")].map((el) => {
      const url = new URL(el.textContent.trim());
      if (url.protocol !== "https:" || url.host !== host || url.search || url.hash) {
        throw new Error(`Unexpected sitemap URL: ${url}`);
      }
      return url.href;
    }))].sort();
  } finally {
    dom.window.close();
  }
}

/** Ignore CSS classes, asset bundle hashes and hydration scripts. Track actual
 * page text, destinations, photos and search metadata instead. */
export function pageFingerprint(html, url) {
  const dom = new JSDOM(html);
  try {
    const doc = dom.window.document;
    if (/\bnoindex\b/i.test(doc.querySelector('meta[name="robots"]')?.content ?? "")) {
      throw new Error(`Sitemap contains a noindex page: ${url}`);
    }
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (!canonical || new URL(canonical).href !== url) {
      throw new Error(`Missing or mismatched canonical: ${url}`);
    }
    const main = doc.querySelector("main");
    if (!main) throw new Error(`No main content: ${url}`);
    main.querySelectorAll("script, style").forEach((el) => el.remove());
    return digest(JSON.stringify({
      title: doc.title,
      description: doc.querySelector('meta[name="description"]')?.content ?? "",
      text: main.textContent.replace(/\s+/g, " ").trim(),
      links: [...main.querySelectorAll("a[href]")].map((el) => el.getAttribute("href")),
      images: [...main.querySelectorAll("img")].map((el) =>
        ["src", "srcset", "alt"].map((attr) => el.getAttribute(attr))),
      structuredData: [...doc.querySelectorAll('script[type="application/ld+json"]')]
        .map((el) => JSON.parse(el.textContent)),
    }));
  } finally {
    dom.window.close();
  }
}

export function changedUrls(current, previous) {
  if (!previous) return []; // First deployment establishes a baseline.
  if (previous.version !== 1 || previous.host !== current.host || !previous.pages) {
    throw new Error("Invalid IndexNow baseline; refusing to submit unrelated URLs.");
  }
  return [...new Set([
    ...Object.keys(current.pages).filter((url) => current.pages[url] !== previous.pages[url]),
    ...Object.keys(previous.pages).filter((url) => !(url in current.pages)),
  ])].sort();
}

async function config() {
  const value = JSON.parse(await fs.readFile("indexnow.config.json", "utf8"));
  if (!/^[a-z0-9-]{8,128}$/i.test(value.key) || value.host !== "olafdsouza.com") {
    throw new Error("Invalid IndexNow configuration.");
  }
  return value;
}

async function prepare() {
  const { host, key } = await config();
  const xml = await fs.readFile(sitemapPath, "utf8");
  const pages = {};
  for (const url of sitemapUrls(xml, host)) {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const filename = pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`;
    const html = await fs.readFile(path.join("dist/client", filename), "utf8");
    pages[url] = pageFingerprint(html, url);
  }
  const builtKey = await fs.readFile(`dist/client/${key}.txt`, "utf8");
  if (builtKey.trim() !== key) throw new Error("Key file is missing from the build.");
  await fs.mkdir(stateDir, { recursive: true });
  await fs.writeFile(currentPath, JSON.stringify({ version: 1, host, sitemapHash: digest(xml), pages }));
  console.log(`Prepared IndexNow fingerprints for ${Object.keys(pages).length} indexable pages.`);
}

export async function submitBatch(payload, fetcher = fetch, pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let response;
    try {
      response = await fetcher("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });
    } catch (error) {
      if (attempt === 2) throw error;
      await pause(2000 * (attempt + 1));
      continue;
    }
    if (response.status === 200 || response.status === 202) return response.status;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 2) throw new Error(`IndexNow returned HTTP ${response.status}; baseline preserved for retry.`);
    const retryAfter = response.headers.get("Retry-After");
    const delay = retryAfter && /^\d+$/.test(retryAfter)
      ? Number(retryAfter) * 1000
      : retryAfter ? Math.max(0, Date.parse(retryAfter) - Date.now()) : 2000 * (attempt + 1);
    if (!Number.isFinite(delay) || delay > 60000) throw new Error("IndexNow requested a longer retry delay; rerun the workflow later.");
    await pause(delay);
  }
}

async function submit() {
  const { host, key } = await config();
  const current = JSON.parse(await fs.readFile(currentPath, "utf8"));
  let previous;
  try {
    previous = JSON.parse(await fs.readFile(previousPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const urls = changedUrls(current, previous);
  // Ensure the production deployment is available before any notification or
  // baseline update. A failed deployment must not consume the pending changes.
  const keyLocation = `https://${host}/${key}.txt`;
  const keyResponse = await fetch(keyLocation, { cache: "no-store", signal: AbortSignal.timeout(30000) });
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) {
    throw new Error("Production IndexNow key verification failed.");
  }
  const sitemapResponse = await fetch(`https://${host}/sitemap.xml?indexnow=${process.env.GITHUB_SHA ?? Date.now()}`, {
    cache: "no-store", signal: AbortSignal.timeout(30000),
  });
  if (!sitemapResponse.ok || digest(await sitemapResponse.text()) !== current.sitemapHash) {
    throw new Error("Production sitemap does not match this build; baseline preserved.");
  }
  for (let offset = 0; offset < urls.length; offset += 10000) {
    const urlList = urls.slice(offset, offset + 10000);
    const status = await submitBatch({ host, key, keyLocation, urlList });
    console.log(`IndexNow received ${urlList.length} URLs (HTTP ${status}${status === 202 ? "; key validation pending" : ""}).`);
    urlList.forEach((url) => console.log(`  ${url}`));
  }
  // Save only after every batch succeeds. The Actions cache preserves this
  // across deployments; failures leave the old baseline available for retry.
  await fs.copyFile(currentPath, previousPath);
  console.log(previous
    ? `${urls.length} added, changed or removed URLs notified.`
    : "Initial baseline saved. Future content changes will notify IndexNow; existing unchanged pages were not resubmitted.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  const operation = command === "prepare" ? prepare : command === "submit" ? submit : undefined;
  if (!operation) {
    console.error("Usage: node scripts/indexnow.mjs prepare|submit");
    process.exitCode = 1;
  } else {
    operation().catch((error) => { console.error(error); process.exitCode = 1; });
  }
}
