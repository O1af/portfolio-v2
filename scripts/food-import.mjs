#!/usr/bin/env node
// Turns a ratings export (zip or unpacked directory) into content/food/ratings.json,
// creates overlay stubs for places whose notes were already edited in the notebook,
// and prints what changed since the previous import.
//
//   pnpm food:import ~/Downloads/export.zip [--upload]
//
// Photos are resized into .food-export/web/ on every run (cached). With --upload,
// any that aren't on the image host yet are pushed to R2. Uploading shells out to
// wrangler, which needs Node 22: `nvm exec 22 pnpm food:import <zip> --upload`.

import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const OUT_PATH = "content/food/ratings.json";
const OVERLAY_DIR = "content/food/places";
const REGIONS_PATH = "content/food/regions.json";
const EXPORT_DIR = ".food-export";

const CATEGORY = { RES: "restaurants", COF: "coffee", DES: "dessert", BAK: "bakeries", BAR: "bars" };
const STATUS = { CLOSED_PERMANENTLY: "closed", CLOSED_TEMPORARILY: "temporarily-closed" };
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const PHOTO_ID_LENGTH = 16;
const WEB_DIR = path.join(EXPORT_DIR, "web");
const BUCKET = "portfolio-images";
const IMAGE_HOST = "https://img.olafdsouza.com";
const ACCOUNT_ID = "e2b5a4ea5442b05be2f53900f0896bf7";
/** Keep in sync with photoUrl() in src/lib/food-core.ts. */
const VARIANTS = [
  { name: "sq128", resize: { width: 128, height: 128, fit: "cover", position: "attention" } },
  { name: "sq", resize: { width: 192, height: 192, fit: "cover", position: "attention" } },
  { name: "480", resize: { width: 480, withoutEnlargement: true } },
  { name: "800", resize: { width: 800, withoutEnlargement: true } },
  { name: "1200", resize: { width: 1200, withoutEnlargement: true } },
];
const photoKey = (id, variant) => `food/${id}-${variant}.webp`;

// ---------- helpers ----------

const TRANSLITERATE = { ø: "o", æ: "ae", œ: "oe", ß: "ss", đ: "d", ł: "l", þ: "th" };

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[øæœßđłþ]/g, (c) => TRANSLITERATE[c])
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const cityName = (city) => city.split(",")[0].trim();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "Hyperion Coffee Co - Ann Arbor" → "Hyperion Coffee Co" when the suffix is the place's own city. */
export function stripCitySuffix(name, city) {
  const suffix = new RegExp(`\\s*[-–|(]\\s*${escapeRegex(cityName(city))}\\)?\\s*$`, "i");
  return name.replace(suffix, "").trim() || name;
}

/** "Jun 6, 2026" → "2026-06-06" */
export function parseVisitDate(text) {
  const match = /^([A-Za-z]{3})\w*\s+(\d{1,2}),\s*(\d{4})$/.exec(text ?? "");
  if (!match) return undefined;
  const month = MONTHS.indexOf(match[1].toLowerCase()) + 1;
  if (!month) return undefined;
  return `${match[3]}-${String(month).padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}

export function cleanNote(text) {
  const cleaned = (text ?? "").replace(/^\s*re-?ranking\s*[:,-]?\s*/i, "").replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}

/** Placeholder captions that say nothing about the dish; dropped so alt text falls back to the place. */
const GENERIC_CAPTION = /^(food|foods|drinks?|dessert|vibes?|forgot|menu|pic|photo)$/i;

export function cleanCaption(text) {
  const caption = text?.trim();
  return caption && !GENERIC_CAPTION.test(caption) ? caption : undefined;
}

const isTea = (cuisine) => /\b(tea|boba|matcha)\b/i.test(cuisine);
const isCoffee = (cuisine) => /coffee/i.test(cuisine);

export function kindOf(place) {
  if (place.category !== "COF") return undefined;
  const cuisines = place.cuisines ?? [];
  return cuisines.some(isTea) && !cuisines.some(isCoffee) ? "tea" : "coffee";
}

/** [day (0 = Sunday), open, close]; a null close means open around the clock. Split shifts stay separate. */
function compactHours(hours) {
  if (!hours?.length) return undefined;
  return [...hours]
    .filter((h) => h.open_time)
    .sort((a, b) => a.open_day - b.open_day || a.open_time.localeCompare(b.open_time))
    .map((h) => [h.open_day, h.open_time.slice(0, 5), h.close_time?.slice(0, 5) ?? "24:00"]);
}

/** The note as it exists on the ratings platform; notebook edits belong in overlays instead. */
function sourceNote(place, notes) {
  const noteId =
    place.current_note_source === "notebook"
      ? place.original_notes?.findLast((n) => n.source === "beli")?.note_id
      : place.current_note_id;
  return cleanNote(notes[noteId]?.text);
}

function notebookNote(place, notes) {
  return place.current_note_source === "notebook" ? cleanNote(notes[place.current_note_id]?.text) : undefined;
}

// ---------- regions ----------

function loadRegions() {
  return JSON.parse(fs.readFileSync(REGIONS_PATH, "utf8"));
}

function regionResolver(configured) {
  const byCity = new Map(configured.flatMap((r) => r.cities.map((c) => [c, r])));
  const derived = new Map();
  return {
    resolve(city) {
      const known = byCity.get(city);
      if (known) return known.slug;
      const name = cityName(city);
      const slug = slugify(name);
      derived.set(slug, { slug, name, cities: [city] });
      return slug;
    },
    /**
     * The value guides filter on, when it isn't the neighborhood: the city itself in an
     * area like South Bay, or the suburb in a city region (Ypsilanti within Ann Arbor).
     */
    area(city) {
      const region = byCity.get(city);
      if (!region || region.cities.length < 2) return undefined;
      const names = region.cities.map(cityName);
      const isCityRegion = names.includes(region.name);
      const town = cityName(city).replace(/^Township of /, "").replace(/ (Charter )?Township$/, "");
      return !isCityRegion || town !== region.name ? town : undefined;
    },
    all(places) {
      const counts = new Map();
      for (const p of places) counts.set(p.region, (counts.get(p.region) ?? 0) + 1);
      return [...configured, ...derived.values()]
        .filter((r) => counts.has(r.slug))
        .map((r) => ({ ...r, count: counts.get(r.slug) }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    },
  };
}

// ---------- extraction ----------

function extract(input) {
  if (fs.statSync(input).isDirectory()) return input;
  fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  execFileSync("unzip", ["-oq", input, "-d", EXPORT_DIR], { stdio: "inherit" });
  return EXPORT_DIR;
}

// ---------- transform ----------

function buildPlace(raw, data, regions) {
  const name = stripCitySuffix(raw.name, raw.city);
  const photos = (raw.photo_ids ?? [])
    .map((id) => data.photos[id])
    .filter((photo) => photo && data.assets[photo.asset_id])
    .sort((a, b) => a.order - b.order)
    .map((photo) => ({
      id: data.assets[photo.asset_id].sha256.slice(0, PHOTO_ID_LENGTH),
      ...(cleanCaption(photo.caption) && { caption: cleanCaption(photo.caption) }),
      file: data.assets[photo.asset_id].file,
    }));
  const latestVisit = raw.visits?.find((v) => v.id === raw.latest_visit_id) ?? raw.visits?.at(-1);

  return prune({
    id: raw.business_id,
    slug: undefined, // assigned after all places are known (collision handling)
    name,
    category: CATEGORY[raw.category],
    kind: kindOf(raw),
    score: Math.round(raw.score * 100) / 100,
    city: raw.city,
    region: regions.resolve(raw.city),
    neighborhood: raw.neighborhood || undefined,
    area: regions.area(raw.city),
    borough: raw.borough || undefined,
    lat: raw.latitude,
    lng: raw.longitude,
    placeId: raw.google_place_id || undefined,
    website: raw.website || undefined,
    phone: raw.phone_number || undefined,
    cuisines: raw.cuisines?.length ? raw.cuisines : undefined,
    hours: compactHours(raw.hours_snapshot),
    status: STATUS[raw.business_status_snapshot],
    visited: parseVisitDate(latestVisit?.visit_dt_str),
    note: sourceNote(raw, data.notes),
    dishes: raw.dishes?.length
      ? raw.dishes.map((d) => ({ name: d.name, ...(d.must_order && { mustOrder: true }) }))
      : undefined,
    photos: photos.length ? photos : undefined,
  });
}

function prune(object) {
  return Object.fromEntries(Object.entries(object).filter(([, v]) => v !== undefined));
}

/** Slug = kebab name; on collision append the city, then the neighborhood, then the id. */
export function assignSlugs(places) {
  const groups = new Map();
  for (const place of places) {
    const base = slugify(place.name);
    groups.set(base, [...(groups.get(base) ?? []), place]);
  }
  for (const [base, group] of groups) {
    if (group.length === 1) {
      group[0].slug = base;
      continue;
    }
    const distinct = (fn) => new Set(group.map(fn)).size === group.length;
    const suffix = distinct((p) => p.city)
      ? (p) => slugify(cityName(p.city))
      : distinct((p) => p.neighborhood ?? "")
        ? (p) => slugify(p.neighborhood)
        : (p) => String(p.id);
    for (const place of group) place.slug = `${base}-${suffix(place)}`;
  }
  return places.map(({ id, slug, ...rest }) => ({ id, slug, ...rest }));
}

// ---------- overlays ----------

const yamlString = (s) => JSON.stringify(s);

function overlayMarkdown({ id, status, updated, dishes, body }) {
  const lines = [`id: ${id}`, `status: ${status}`, `updated: ${updated}`];
  if (dishes?.length) {
    lines.push("dishes:");
    for (const d of dishes) {
      lines.push(`  - name: ${yamlString(d.name)}`);
      if (d.mustOrder) lines.push("    must_order: true");
    }
  }
  return `---\n${lines.join("\n")}\n---\n${body ? `${body}\n` : ""}`;
}

function createNotebookOverlays(places, rawById, data) {
  fs.mkdirSync(OVERLAY_DIR, { recursive: true });
  const created = [];
  for (const place of places) {
    const raw = rawById.get(place.id);
    if (raw.dishes_source !== "notebook" && raw.current_note_source !== "notebook") continue;
    const file = path.join(OVERLAY_DIR, `${place.slug}.md`);
    if (fs.existsSync(file)) continue;
    fs.writeFileSync(
      file,
      overlayMarkdown({
        id: place.id,
        status: "done",
        updated: (raw.notebook_updated_at ?? data.notebook_snapshot_at ?? data.exported_at).slice(0, 10),
        dishes: raw.dishes_source === "notebook" ? place.dishes : undefined,
        body: notebookNote(raw, data.notes) ?? "",
      })
    );
    created.push(file);
  }
  return created;
}

// ---------- diff ----------

const score1 = (p) => p.score.toFixed(1);
const label = (p) => `${p.name} (${p.city}) ${score1(p)}`;

function diff(previous, next) {
  const before = new Map((previous?.places ?? []).map((p) => [p.id, p]));
  const after = new Map(next.places.map((p) => [p.id, p]));
  const photoIds = (p) => new Set((p.photos ?? []).map((ph) => ph.id));

  const added = next.places.filter((p) => !before.has(p.id));
  const removed = [...before.values()].filter((p) => !after.has(p.id));
  const scoreChanges = [];
  const newlyClosed = [];
  const slugChanges = [];
  let newPhotos = 0;
  const newPhotoPlaces = [];

  for (const p of next.places) {
    const old = before.get(p.id);
    if (!old) {
      newPhotos += p.photos?.length ?? 0;
      continue;
    }
    if (score1(old) !== score1(p)) scoreChanges.push(`${p.name}: ${score1(old)} → ${score1(p)}`);
    if (p.status === "closed" && old.status !== "closed") newlyClosed.push(p.name);
    if (old.slug !== p.slug) slugChanges.push(`${old.slug} → ${p.slug}`);
    const fresh = [...photoIds(p)].filter((id) => !photoIds(old).has(id)).length;
    if (fresh) {
      newPhotos += fresh;
      newPhotoPlaces.push(`${p.name} (+${fresh})`);
    }
  }

  return { added, removed, scoreChanges, newlyClosed, slugChanges, newPhotos, newPhotoPlaces };
}

function printDiff(d, first) {
  const section = (title, items, max = 15) => {
    console.log(`\n${title}: ${items.length}`);
    for (const item of items.slice(0, max)) console.log(`  ${item}`);
    if (items.length > max) console.log(`  … and ${items.length - max} more`);
  };
  if (first) {
    console.log(`\nFirst import: ${d.added.length} places, ${d.newPhotos} photos.`);
    return;
  }
  section("New places", d.added.map(label));
  section("Removed places", d.removed.map(label));
  section("Score changes", d.scoreChanges);
  section("Newly closed", d.newlyClosed);
  section("Slug changes", d.slugChanges);
  section(`New photos (${d.newPhotos})`, d.newPhotoPlaces);
}

// ---------- photos ----------

async function pool(items, concurrency, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

/**
 * Resizes every photo into WEB_DIR (skipping ones already there) and replaces the
 * transient `file` with the 1200px variant's dimensions, so pages can reserve space.
 */
async function processPhotos(places, dir) {
  fs.mkdirSync(WEB_DIR, { recursive: true });
  const files = new Map(places.flatMap((p) => p.photos ?? []).map((ph) => [ph.id, ph.file]));
  const dims = new Map();
  let created = 0;
  await pool([...files], 4, async ([id, file]) => {
    for (const variant of VARIANTS) {
      const out = path.join(WEB_DIR, path.basename(photoKey(id, variant.name)));
      if (fs.existsSync(out)) continue;
      await sharp(path.join(dir, file)).rotate().resize(variant.resize).webp({ quality: 74, effort: 5 }).toFile(out);
      created++;
    }
    const { width, height } = await sharp(path.join(WEB_DIR, path.basename(photoKey(id, "1200")))).metadata();
    dims.set(id, { w: width, h: height });
  });
  for (const place of places) {
    place.photos = place.photos?.map(({ file, ...photo }) => ({ ...photo, ...dims.get(photo.id) }));
  }
  return { total: files.size, created };
}

const run = promisify(execFile);

async function isHosted(key) {
  try {
    // The query string keeps this probe out of the real URL's edge cache (a cached 404 lingers ~3 min).
    return (await fetch(`${IMAGE_HOST}/${key}?probe=${Date.now()}`, { method: "HEAD" })).ok;
  } catch {
    return false;
  }
}

async function uploadPhotos(places) {
  if (Number(process.versions.node.split(".")[0]) < 22) {
    throw new Error("--upload runs wrangler, which needs Node 22: nvm exec 22 pnpm food:import <zip> --upload");
  }
  const keys = [...new Set(places.flatMap((p) => p.photos ?? []).flatMap((ph) => VARIANTS.map((v) => photoKey(ph.id, v.name))))];
  const missing = [];
  await pool(keys, 16, async (key) => {
    if (!(await isHosted(key))) missing.push(key);
  });
  console.log(`\nUploading ${missing.length} of ${keys.length} image files to R2 (${BUCKET})…`);
  let done = 0;
  await pool(missing, 8, async (key) => {
    await run(
      "pnpm",
      [
        "exec", "wrangler", "r2", "object", "put", `${BUCKET}/${key}`, "--remote",
        "--file", path.join(WEB_DIR, path.basename(key)),
        "--content-type", "image/webp",
        "--cache-control", "public, max-age=31536000, immutable",
      ],
      { env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID } }
    );
    if (++done % 100 === 0 || done === missing.length) console.log(`  ${done}/${missing.length}`);
  });
}

// ---------- main ----------

/** One place per line: compact on disk, still line-diffable in git. */
function serialize({ places, ...header }) {
  const head = JSON.stringify(header, null, 1).replace(/\n}$/, ",\n");
  return `${head} "places": [\n${places.map((p) => JSON.stringify(p)).join(",\n")}\n]\n}\n`;
}

function summarize(next, created) {
  const count = (fn) => next.places.filter(fn).length;
  console.log(`\nWrote ${OUT_PATH}: ${next.places.length} places`);
  for (const category of Object.values(CATEGORY)) console.log(`  ${category.padEnd(12)} ${count((p) => p.category === category)}`);
  console.log(`  tea/boba kind ${count((p) => p.kind === "tea")}`);
  console.log(`  with a page  ${count((p) => p.photos || p.note)} (photo or note)`);
  console.log(`  closed       ${count((p) => p.status === "closed")}`);
  console.log(`\nRegions: ${next.regions.map((r) => `${r.name} ${r.count}`).join(", ")}`);
  console.log(`\nOverlays created: ${created.length}`);
  for (const file of created) console.log(`  ${file}`);
}

async function main() {
  const args = process.argv.slice(2);
  const upload = args.includes("--upload");
  const input = args.find((a) => !a.startsWith("--"));
  if (!input) {
    console.error("usage: pnpm food:import <export.zip | directory> [--upload]");
    process.exit(1);
  }

  const dir = extract(input);
  const data = JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));
  const regions = regionResolver(loadRegions());
  const raws = Object.values(data.places);
  const rawById = new Map(raws.map((r) => [r.business_id, r]));

  const places = assignSlugs(raws.map((raw) => buildPlace(raw, data, regions))).sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name)
  );
  const photoIds = places.flatMap((p) => (p.photos ?? []).map((ph) => ph.id));
  const hashes = raws.flatMap((r) => r.photo_ids ?? []).map((id) => data.assets[data.photos[id]?.asset_id]?.sha256);
  if (new Set(photoIds).size !== new Set(hashes).size) {
    throw new Error("truncated photo ids collide; raise PHOTO_ID_LENGTH");
  }
  const photoStats = await processPhotos(places, dir);

  const next = {
    exportedAt: data.exported_at,
    regions: regions.all(places),
    places,
  };
  const previous = fs.existsSync(OUT_PATH) ? JSON.parse(fs.readFileSync(OUT_PATH, "utf8")) : undefined;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, serialize(next));
  const created = createNotebookOverlays(places, rawById, data);

  summarize(next, created);
  console.log(`\nPhotos: ${photoStats.total} (${photoStats.created} new resized files in ${WEB_DIR})`);
  printDiff(diff(previous, next), !previous);
  if (upload) await uploadPhotos(places);
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
