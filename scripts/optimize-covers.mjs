#!/usr/bin/env node
// Writes 480, 800 and 1200px WebP copies next to each post's cover image
// (e.g. hops.png -> hops-480.webp, hops-1200.webp). Originals stay for social
// previews. Skips copies that already exist; runs in the pre-commit hook.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/covers";
const POSTS = "content/posts";
const WIDTHS = [480, 800, 1200];
const SOURCE = /\.(png|jpe?g)$/i;

// Only covers a post actually uses (frontmatter `image: /covers/<file>`).
const covers = fs
  .readdirSync(POSTS)
  .map((f) => fs.readFileSync(path.join(POSTS, f), "utf8").match(/^image:\s*\/covers\/(\S+)\s*$/m)?.[1])
  .filter((file) => file && SOURCE.test(file));

let written = 0;
for (const file of covers) {
  const base = file.replace(SOURCE, "");
  for (const width of WIDTHS) {
    const out = path.join(DIR, `${base}-${width}.webp`);
    if (fs.existsSync(out)) continue;
    await sharp(path.join(DIR, file)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
    written++;
  }
}
if (written) console.log(`Wrote ${written} cover image(s) to ${DIR}`);
