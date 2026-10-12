import test from "node:test";
import assert from "node:assert/strict";
import { changedUrls, pageFingerprint, sitemapUrls, submitBatch } from "./indexnow.mjs";

const url = "https://olafdsouza.com/food/place/test";
const html = (note = "Original note", photo = "one.webp", css = "first") =>
  `<html><head><title>Test</title><link rel="canonical" href="${url}"><meta name="description" content="Review"></head><body><main class="${css}"><p>${note}</p><img src="${photo}" alt="Food"><a href="/food">Food</a></main><script src="/${css}.js"></script></body></html>`;

test("notes and photos trigger changes; cosmetic classes and bundles do not", () => {
  const first = pageFingerprint(html(), url);
  assert.equal(first, pageFingerprint(html("Original note", "one.webp", "second"), url));
  assert.notEqual(first, pageFingerprint(html("Updated note"), url));
  assert.notEqual(first, pageFingerprint(html("Original note", "two.webp"), url));
});

test("sitemap includes only canonical host page URLs, not image URLs", () => {
  const xml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><url><loc>${url}</loc><image:image><image:loc>https://img.olafdsouza.com/photo.webp</image:loc></image:image></url></urlset>`;
  assert.deepEqual(sitemapUrls(xml, "olafdsouza.com"), [url]);
  assert.throws(() => sitemapUrls(xml.replace(url, "https://other.example/page"), "olafdsouza.com"));
  assert.throws(() => sitemapUrls(xml.replace(url, `${url}?min=9`), "olafdsouza.com"));
});

test("noindex and mismatched canonical pages fail preparation", () => {
  assert.throws(() => pageFingerprint(html().replace("<title>", '<meta name="robots" content="noindex"><title>'), url));
  assert.throws(() => pageFingerprint(html(), "https://olafdsouza.com/different"));
  assert.doesNotThrow(() => pageFingerprint(html().replace(url, "https://olafdsouza.com"), "https://olafdsouza.com/"));
});

test("diff covers added, edited and removed pages and initial baseline", () => {
  const previous = { version: 1, host: "olafdsouza.com", pages: { a: "1", b: "2", c: "3" } };
  const current = { version: 1, host: "olafdsouza.com", pages: { a: "1", b: "changed", d: "4" } };
  assert.deepEqual(changedUrls(current, previous), ["b", "c", "d"]);
  assert.deepEqual(changedUrls(current), []);
  assert.throws(() => changedUrls(current, { ...previous, host: "other.example" }));
});

test("accepted pending verification is success; rate limits retry; invalid keys fail", async () => {
  const payload = { host: "olafdsouza.com", urlList: [url] };
  assert.equal(await submitBatch(payload, async () => new Response(null, { status: 202 })), 202);
  let calls = 0;
  const delays = [];
  assert.equal(await submitBatch(payload, async (_endpoint, request) => {
    assert.deepEqual(JSON.parse(request.body), payload);
    return ++calls === 1 ? new Response(null, { status: 429, headers: { "Retry-After": "1" } }) : new Response(null, { status: 200 });
  }, async (ms) => delays.push(ms)), 200);
  assert.deepEqual(delays, [1000]);
  await assert.rejects(submitBatch(payload, async () => new Response(null, { status: 403 })), /HTTP 403/);
  await assert.rejects(submitBatch(payload, async () => new Response(null, { status: 429, headers: { "Retry-After": "120" } })), /rerun/);
});
