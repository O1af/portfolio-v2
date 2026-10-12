# IndexNow

The production Deploy workflow publishes the key file and notifies
`https://api.indexnow.org/indexnow` after a successful Cloudflare deployment.
The key in `indexnow.config.json` is an ownership-verification value, served
publicly as `/<key>.txt`; it is not a GitHub or Cloudflare access token.

## Automatic submissions

`node scripts/indexnow.mjs prepare` reads the built sitemap and prerendered
HTML. It fingerprints main page text, links, images, title, description and
structured data, ignoring CSS classes and JavaScript bundle names. Only
canonical, indexable sitemap pages are eligible; image-host URLs and filtered
views are excluded. A changed place can also change the fingerprint of its
parent guides, so those are automatically included.

`node scripts/indexnow.mjs submit` checks the production key and sitemap, then
notifies added, changed and removed URLs in batches of at most 10,000. HTTP
200 means received; 202 means received with key validation pending. Neither
guarantees crawling, indexing or ranking.

The first deployment establishes a baseline without resubmitting unchanged
pages. Each successful notification saves `.indexnow/previous.json` in the
GitHub Actions cache. Failed requests leave the previous baseline intact.
Rerun the failed workflow, or use **Actions → Deploy → Run workflow** to retry.
Production deployments run sequentially to avoid cache/deployment races.

If GitHub evicts the baseline cache, the next deployment logs that it is
establishing a new baseline; existing changes cannot be reconstructed from a
missing cache. The sitemap remains the complete discovery source.

## Local verification

Use Node 22 and the locked pnpm version:

```sh
node --test scripts/indexnow.test.mjs
pnpm seo:generate
pnpm build
node scripts/indexnow.mjs prepare
```

The `submit` command contacts production and IndexNow, so it is run by the
deployment workflow rather than local tests. The built key file and all
sitemap page canonicals are validated before deployment.

To rotate the key, change `indexnow.config.json` and replace the matching
`public/<key>.txt` file in the same deployment.

Protocol: https://www.indexnow.org/documentation
