#!/usr/bin/env node
// Creates a prefilled overlay for a place so its note and dishes can be edited in git.
//
//   pnpm food:edit <slug>
//
// The stub starts as `status: draft` (the imported note keeps showing) with the
// imported note as the body and dishes prefilled from photo captions. Edit it,
// then set `status: done` to publish the body instead.

import fs from "node:fs";
import path from "node:path";

const RATINGS_PATH = "content/food/ratings.json";
const OVERLAY_DIR = "content/food/places";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: pnpm food:edit <slug>");
  process.exit(1);
}

const { places } = JSON.parse(fs.readFileSync(RATINGS_PATH, "utf8"));
const place = places.find((p) => p.slug === slug);
if (!place) {
  const near = places.filter((p) => p.slug.includes(slug)).map((p) => p.slug);
  console.error(`No place with slug "${slug}".${near.length ? ` Did you mean: ${near.join(", ")}` : ""}`);
  process.exit(1);
}

const file = path.join(OVERLAY_DIR, `${slug}.md`);
if (fs.existsSync(file)) {
  console.log(`Overlay already exists: ${file}`);
  process.exit(0);
}

const lines = [`id: ${place.id}`, "status: draft", `updated: ${new Date().toISOString().slice(0, 10)}`];
if (place.dishes?.length) {
  lines.push("dishes:");
  for (const dish of place.dishes) {
    lines.push(`  - name: ${JSON.stringify(dish.name)}`);
    if (dish.mustOrder) lines.push("    must_order: true");
  }
}

fs.mkdirSync(OVERLAY_DIR, { recursive: true });
fs.writeFileSync(file, `---\n${lines.join("\n")}\n---\n${place.note ? `${place.note}\n` : ""}`);
console.log(`Created ${file} (${place.name}, ${place.score.toFixed(1)}). Set status: done when ready.`);
