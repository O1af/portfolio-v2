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

`prepare` also writes the fingerprints to the build as `/indexnow.json` and,
before the deploy replaces it, fetches the live copy as the baseline. The diff
is therefore always against what is actually in production, with no CI cache
to expire. If the live site has no `/indexnow.json` yet, the deployment only
publishes a baseline and resubmits nothing.

A failed notification is not retried: once the deploy is live, its
fingerprints are the next baseline. The sitemap remains the complete discovery
source. Production deployments run sequentially so each one reads the previous
deployment's baseline.

## Local verification

Use Node 22 and the locked pnpm version:

```sh
node --test scripts/indexnow.test.mjs
pnpm seo:generate
pnpm build
node scripts/indexnow.mjs prepare  # reads the live /indexnow.json
```

The `submit` command contacts production and IndexNow, so it is run by the
deployment workflow rather than local tests. The built key file and all
sitemap page canonicals are validated before deployment.

To rotate the key, change `indexnow.config.json` and replace the matching
`public/<key>.txt` file in the same deployment.

Protocol: https://www.indexnow.org/documentation
