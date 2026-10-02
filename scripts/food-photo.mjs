#!/usr/bin/env node
// Adds a photo of your own to a place, for when the ratings export doesn't have one.
// The photo is resized like imported ones, uploaded to R2, and recorded in the place's
// overlay, so re-imports keep it. Hand-added photos show before imported ones.
//
//   nvm exec 22 pnpm food:photo <slug> <image> ["caption"]

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PHOTO_ID_LENGTH, resizePhoto, uploadPhotos } from "./food-import.mjs";

const RATINGS_PATH = "content/food/ratings.json";
const OVERLAY_DIR = "content/food/places";

const [slug, image, caption] = process.argv.slice(2);
if (!slug || !image) {
  console.error('usage: nvm exec 22 pnpm food:photo <slug> <image> ["caption"]');
  process.exit(1);
}

const { places } = JSON.parse(fs.readFileSync(RATINGS_PATH, "utf8"));
const place = places.find((p) => p.slug === slug);
if (!place) {
  const near = places.filter((p) => p.slug.includes(slug)).map((p) => p.slug);
  console.error(`No place with slug "${slug}".${near.length ? ` Did you mean: ${near.join(", ")}` : ""}`);
  process.exit(1);
}

const id = crypto.createHash("sha256").update(fs.readFileSync(image)).digest("hex").slice(0, PHOTO_ID_LENGTH);
const { w, h } = await resizePhoto(id, image);
await uploadPhotos([id]);

const file = path.join(OVERLAY_DIR, `${slug}.md`);
const today = new Date().toISOString().slice(0, 10);
const markdown = fs.existsSync(file)
  ? fs.readFileSync(file, "utf8")
  : `---\nid: ${place.id}\nstatus: draft\nupdated: ${today}\n---\n`;
if (markdown.includes(`id: "${id}"`)) {
  console.log(`${file} already has this photo (${id}).`);
  process.exit(0);
}

const entry = [`  - id: "${id}"`, `    w: ${w}`, `    h: ${h}`, ...(caption ? [`    caption: ${JSON.stringify(caption)}`] : [])];
const end = markdown.indexOf("\n---", 3);
const lines = markdown.slice(0, end).split("\n");
const start = lines.indexOf("photos:");
if (start === -1) {
  lines.push("photos:", ...entry);
} else {
  let last = start;
  while (lines[last + 1]?.startsWith("  ")) last++;
  lines.splice(last + 1, 0, ...entry);
}
fs.mkdirSync(OVERLAY_DIR, { recursive: true });
fs.writeFileSync(file, lines.join("\n") + markdown.slice(end));
console.log(`Added photo ${id} (${w}×${h}) to ${file}.`);
