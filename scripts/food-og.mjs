#!/usr/bin/env node
// Renders 1200×630 share cards (Open Graph / Twitter) for every food page: the hub,
// regions, guides and places. Cards are named by a hash of what they show, so a
// changed score or photo produces a new URL and nothing stale is ever cached.
//
//   pnpm food:og                              render into .food-export/og/ to preview
//   nvm exec 22 pnpm food:og --upload         also push new cards to R2 and write content/food/og.json
//
// Run it after `food:import`, or after editing overlays or guides. Pages without a
// card fall back to their first photo.

import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { createBuilder } from "@content-collections/core";
import satori from "satori";
import sharp from "sharp";
import { runnerImport } from "vite";

const OUT_DIR = ".food-export/og";
const PHOTO_DIR = ".food-export/web";
const MANIFEST = "content/food/og.json";
const BUCKET = "portfolio-images";
const IMAGE_HOST = "https://img.olafdsouza.com";
const ACCOUNT_ID = "e2b5a4ea5442b05be2f53900f0896bf7";
const WIDTH = 1200;
const HEIGHT = 630;
/** Bump when the card design changes to re-render everything. */
const TEMPLATE = 2;

const C = {
  bg: "#ffffff",
  fg: "#0a0a0a",
  muted: "#666666",
  dim: "#a3a3a3",
  border: "#ebebeb",
  tile: "#f4f4f4",
};

// ---------- data ----------

async function loadFood() {
  const builder = await createBuilder(path.resolve("content-collections.ts"));
  await builder.build();
  const generated = await import(`${path.resolve(".content-collections/generated/index.js")}?t=${Date.now()}`);
  const load = async (id) => (await runnerImport(id, { configFile: false, logLevel: "silent" })).module;
  const [core, format] = await Promise.all([load("/src/lib/food-core.ts"), load("/src/lib/food-format.ts")]);
  const ratings = JSON.parse(fs.readFileSync("content/food/ratings.json", "utf8"));
  return { core, format, ...core.assembleFood(ratings, generated.allFoodPlaces, generated.allFoodGuides) };
}

function cards({ core, format, places, guides, regions }) {
  const visible = places.filter((p) => !p.hidden);
  const byScore = [...visible].filter((p) => p.status !== "closed").sort((a, b) => b.score - a.score);
  const tile = (p) => ({ name: p.name, score: p.score.toFixed(1), photo: p.photos[0]?.id });
  const withPhotos = (list) => list.filter((p) => p.photos.length).slice(0, 3).map(tile);
  const regionsWithGuides = regions.filter((r) => guides.some((g) => g.region.slug === r.slug));

  const list = [
    {
      key: "hub",
      kind: "collection",
      title: "Food",
      subtitle: `${visible.length} places rated across ${regionsWithGuides.length} cities, ranked`,
      tiles: withPhotos(byScore),
    },
    ...regionsWithGuides.map((r) => ({
      key: `region/${r.slug}`,
      kind: "collection",
      title: `Where to eat in ${core.regionPhrase(r)}`,
      subtitle: `${visible.filter((p) => p.region === r.slug).length} places · ${guides.filter((g) => g.region.slug === r.slug).length} ranked guides`,
      tiles: withPhotos(byScore.filter((p) => p.region === r.slug)),
    })),
    ...(() => {
      const trips = visible.filter((p) => !regionsWithGuides.some((r) => r.slug === p.region));
      return trips.length
        ? [{
            key: "elsewhere",
            kind: "collection",
            title: "Elsewhere",
            subtitle: `${trips.length} places from trips, grouped by city`,
            tiles: withPhotos([...trips].sort((a, b) => b.score - a.score)),
          }]
        : [];
    })(),
    ...guides.map((g) => ({
      key: `guide/${g.path}`,
      kind: "collection",
      title: g.title,
      subtitle: `${g.places.length} places, ranked by score`,
      tiles: withPhotos(g.places.filter((p) => p.status !== "closed")),
    })),
    ...visible
      .filter((p) => p.hasPage)
      .map((p) => {
        const guide = guides.find((g) => !g.custom && g.region.slug === p.region && g.category === p.category);
        const rank = guide ? guide.places.indexOf(p) + 1 : 0;
        return {
          key: `place/${p.slug}`,
          kind: "place",
          name: p.name,
          score: p.score.toFixed(1),
          where: `${format.placeLocation(p.city, core.areaOf(p), p.neighborhood)} · ${format.placeType(p.category, p.kind, p.cuisines)}`,
          rank: guide ? `#${rank} of ${guide.places.length} · ${guide.region.name} ${format.lowerLabel(guide.label)}` : undefined,
          closed: p.status === "closed",
          photo: p.photos[0]?.id,
        };
      }),
  ];
  return list.map((card) => ({ ...card, hash: hashOf(card) }));
}

const hashOf = ({ key, ...card }) =>
  crypto.createHash("sha256").update(JSON.stringify({ TEMPLATE, card })).digest("hex").slice(0, 16);

// ---------- rendering ----------

const fonts = [
  ["Geist", 400, "@fontsource/geist/files/geist-latin-400-normal.woff"],
  ["Geist", 500, "@fontsource/geist/files/geist-latin-500-normal.woff"],
  ["Geist", 600, "@fontsource/geist/files/geist-latin-600-normal.woff"],
  ["Geist Mono", 600, "@fontsource/geist-mono/files/geist-mono-latin-600-normal.woff"],
].map(([name, weight, file]) => ({ name, weight, style: "normal", data: fs.readFileSync(path.join("node_modules", file)) }));

/** Minimal element builder for satori (it takes React-shaped objects). */
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat().filter((c) => c != null && c !== false) },
});

const clip = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);

const MONOGRAM_STOP = new Set(["the", "of", "and", "&", "a"]);
const monogram = (name) => {
  const words = name.split(/\s+/).filter((w) => /^[a-z0-9]/i.test(w) && !MONOGRAM_STOP.has(w.toLowerCase()));
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? words[0]?.[1] ?? "")).toUpperCase();
};

async function photoData(id, width, height) {
  const local = path.join(PHOTO_DIR, `${id}-800.webp`);
  const source = fs.existsSync(local)
    ? fs.readFileSync(local)
    : Buffer.from(await (await fetch(`${IMAGE_HOST}/food/${id}-800.webp`)).arrayBuffer());
  const jpeg = await sharp(source).resize(width, height, { fit: "cover", position: "attention" }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

const image = (src, width, height, style = {}) => ({ type: "img", props: { src, width, height, style } });

const label = () =>
  h("div", { fontSize: 22, fontWeight: 500, color: C.dim, letterSpacing: "0.08em" }, "OLAF DSOUZA · FOOD");

async function placeCard(card) {
  const side = card.photo
    ? image(await photoData(card.photo, HEIGHT, HEIGHT), HEIGHT, HEIGHT)
    : h(
        "div",
        { width: HEIGHT, height: HEIGHT, alignItems: "center", justifyContent: "center", backgroundColor: C.tile, color: C.dim, fontSize: 160, fontWeight: 600, fontFamily: "Geist Mono" },
        monogram(card.name)
      );
  return h(
    "div",
    { width: WIDTH, height: HEIGHT, backgroundColor: C.bg, fontFamily: "Geist" },
    side,
    h(
      "div",
      { flexDirection: "column", justifyContent: "space-between", width: WIDTH - HEIGHT, padding: "56px 60px" },
      h(
        "div",
        { flexDirection: "column" },
        label(),
        h("div", { marginTop: 28, fontSize: 56, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", color: C.fg }, clip(card.name, 48)),
        h("div", { marginTop: 18, fontSize: 26, lineHeight: 1.35, color: C.muted }, clip(card.where, 70)),
        card.closed && h("div", { marginTop: 14, fontSize: 22, color: C.dim }, "Permanently closed")
      ),
      h(
        "div",
        { flexDirection: "column" },
        h(
          "div",
          { alignItems: "flex-end" },
          h("div", { fontSize: 136, fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1, color: C.fg }, card.score),
          h("div", { marginLeft: 12, marginBottom: 12, fontSize: 34, color: C.dim }, "/10")
        ),
        card.rank && h("div", { marginTop: 16, fontSize: 24, color: C.muted }, card.rank)
      )
    )
  );
}

async function collectionCard(card) {
  const tileWidth = 336;
  const tiles = await Promise.all(
    card.tiles.map(async (t) =>
      h(
        "div",
        { flexDirection: "column", width: tileWidth },
        t.photo
          ? image(await photoData(t.photo, tileWidth * 2, 200 * 2), tileWidth, 200, { borderRadius: 16 })
          : h("div", { width: tileWidth, height: 200, borderRadius: 16, backgroundColor: C.tile }),
        h(
          "div",
          { marginTop: 14, justifyContent: "space-between", alignItems: "baseline", fontSize: 24 },
          h("div", { color: C.fg, fontWeight: 500, maxWidth: tileWidth - 80 }, clip(t.name, 22)),
          h("div", { fontFamily: "Geist Mono", fontWeight: 600, color: C.fg }, t.score)
        )
      )
    )
  );
  return h(
    "div",
    { width: WIDTH, height: HEIGHT, flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", backgroundColor: C.bg, fontFamily: "Geist" },
    h(
      "div",
      { flexDirection: "column" },
      label(),
      h("div", { marginTop: 22, fontSize: 64, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, color: C.fg }, clip(card.title, 40)),
      h("div", { marginTop: 14, fontSize: 28, color: C.muted }, card.subtitle)
    ),
    h("div", { gap: 32 }, tiles)
  );
}

async function render(card) {
  const tree = card.kind === "place" ? await placeCard(card) : await collectionCard(card);
  const svg = await satori(tree, { width: WIDTH, height: HEIGHT, fonts });
  await sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT_DIR, `${card.hash}.jpg`));
}

// ---------- upload ----------

const run = promisify(execFile);

async function pool(items, concurrency, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: concurrency }, async () => { while (queue.length) await fn(queue.shift()); }));
}

async function upload(hashes) {
  if (Number(process.versions.node.split(".")[0]) < 22) {
    throw new Error("--upload runs wrangler, which needs Node 22: nvm exec 22 pnpm food:og --upload");
  }
  const missing = [];
  await pool(hashes, 16, async (hash) => {
    // The query string keeps this probe out of the real URL's edge cache (a cached 404 lingers ~3 min).
    const hosted = await fetch(`${IMAGE_HOST}/og/${hash}.jpg?probe=${Date.now()}`, { method: "HEAD" }).then((r) => r.ok, () => false);
    if (!hosted) missing.push(hash);
  });
  console.log(`Uploading ${missing.length} of ${hashes.length} cards to R2…`);
  let done = 0;
  await pool(missing, 8, async (hash) => {
    await run(
      "pnpm",
      ["exec", "wrangler", "r2", "object", "put", `${BUCKET}/og/${hash}.jpg`, "--remote",
        "--file", path.join(OUT_DIR, `${hash}.jpg`), "--content-type", "image/jpeg",
        "--cache-control", "public, max-age=31536000, immutable"],
      { env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID } }
    );
    if (++done % 100 === 0 || done === missing.length) console.log(`  ${done}/${missing.length}`);
  });
}

// ---------- main ----------

async function main() {
  const doUpload = process.argv.includes("--upload");
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const all = cards(await loadFood());

  const todo = [...new Map(all.map((c) => [c.hash, c])).values()].filter((c) => !fs.existsSync(path.join(OUT_DIR, `${c.hash}.jpg`)));
  console.log(`${all.length} cards, ${todo.length} to render`);
  let rendered = 0;
  await pool(todo, 4, async (card) => {
    await render(card);
    if (++rendered % 100 === 0 || rendered === todo.length) console.log(`  rendered ${rendered}/${todo.length}`);
  });

  const manifest = Object.fromEntries(all.map((c) => [c.key, c.hash]).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), `${JSON.stringify(manifest, null, 1)}\n`);

  if (!doUpload) {
    console.log(`Preview in ${OUT_DIR}/ (index.json maps pages to files). Add --upload to publish.`);
    return;
  }
  await upload([...new Set(all.map((c) => c.hash))]);
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 1)}\n`);
  console.log(`Wrote ${MANIFEST} (${all.length} pages)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
