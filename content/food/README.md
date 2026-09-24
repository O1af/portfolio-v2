# Food data

Everything under `/food` on the site comes from these files, merged at build time by `src/lib/food.ts`
(rules in `src/lib/food-core.ts`).

| File | Written by | Holds |
| --- | --- | --- |
| `ratings.json` | `pnpm food:import` only | Every place: score, location, hours, visit date, imported note, photo ids |
| `places/<slug>.md` | you (`pnpm food:edit <slug>`) | Per-place overrides; the body is the published note |
| `guides/<slug>.md` | you | Hand-written guides ("Best Mexican in San Jose") |
| `regions.json` | you, rarely | Which cities roll up into which region |

## Place overlays

Frontmatter: `id` (links to the place; slugs can change), `status`, optional `dishes`, `updated`.

- `draft`: the imported note keeps showing; the body is ignored.
- `done`: the body shows (an empty body means no note).
- `hidden`: no page, and left out of guides and the sitemap.

Only overlay dishes are published (the import's dishes are unreviewed photo captions). Scores can never be
overridden. A place gets a page when it has a photo or a note.

## Guides

Automatic guides exist for every region × category with at least 8 places, at `/food/<region>/<category>`.
Hand-written guides live at `/food/<region>/<slug>`:

```yaml
---
title: Best Mexican in San Jose
region: south-bay
description: One sentence for search results and link previews.
filter:              # pick places by rule, ranked by score...
  category: restaurants
  cuisines: [Mexican, Tacos]
  cities: [San Jose]
  # kind: coffee | tea, neighborhoods: [...], min_score: 8
limit: 10
# places: [slug-one, slug-two]   # ...or hand-pick them, in this order
draft: true          # only visible in `pnpm dev` until removed
---
Intro, in markdown. Write something here: without it the page duplicates an automatic guide.
```

## Photos

`pnpm food:import` unpacks the export into `.food-export/` (gitignored) and resizes every photo into three
WebP files (128px and 192px square thumbnails, 480px, 800px, 1200px), with metadata stripped. Add `--upload` to push any that
aren't on `img.olafdsouza.com` yet to the `portfolio-images` R2 bucket. Upload runs wrangler, which needs
Node 22:

```sh
nvm exec 22 pnpm food:import ~/Downloads/export.zip --upload
```
