// Custom server entry.
//
// 1. The food dataset is imported statically, so parsing and merging ~700 places
//    happens once while the Worker starts (1 s budget) instead of inside the
//    first request that needs it (10 ms CPU budget on the free plan).
// 2. Food pages are cached in Cloudflare's edge cache. They only change when the
//    site is deployed, so the cache key includes the build id: a deploy starts
//    from a clean cache and a hit costs no rendering at all.
import handler from "@tanstack/react-start/server-entry";
import "./lib/food";

declare const __BUILD_ID__: string;

const CACHEABLE_PATH = /^\/food(\/|$)/;
const EDGE_TTL = 60 * 60 * 24 * 7;

type Context = { waitUntil(promise: Promise<unknown>): void };

function cacheKey(url: URL): Request {
  const key = new URL(url);
  key.searchParams.set("__build", __BUILD_ID__);
  return new Request(key);
}

async function cachedFetch(request: Request, ctx?: Context): Promise<Response> {
  const url = new URL(request.url);
  const cache = (globalThis.caches as (CacheStorage & { default?: Cache }) | undefined)?.default;
  if (import.meta.env.DEV || !cache || request.method !== "GET" || !CACHEABLE_PATH.test(url.pathname)) {
    return handler.fetch(request);
  }

  const key = cacheKey(url);
  const hit = await cache.match(key);
  if (hit) return hit;

  const response = await handler.fetch(request);
  const cacheable =
    response.status === 200 &&
    response.headers.get("content-type")?.startsWith("text/html") &&
    !response.headers.has("set-cookie");
  if (!cacheable) return response;

  const stored = new Response(response.body, response);
  // The edge keeps it for a week (until the next deploy changes the key);
  // browsers always revalidate, so a deploy is visible immediately.
  stored.headers.set("Cache-Control", `public, max-age=0, s-maxage=${EDGE_TTL}`);
  const put = cache.put(key, stored.clone());
  if (ctx) ctx.waitUntil(put);
  else await put;
  return stored;
}

export default {
  fetch(request: Request, _env?: unknown, ctx?: Context) {
    return cachedFetch(request, ctx);
  },
};
