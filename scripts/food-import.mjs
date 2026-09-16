#!/usr/bin/env node
// Turns a ratings export (zip or unpacked directory) into content/food/ratings.json,
// creates overlay stubs for places whose notes were already edited in the notebook,
// and prints what changed since the previous import.
//
//   pnpm food:import ~/Downloads/export.zip [--upload]
//
// --upload resizes new photos and pushes them to R2 (not implemented yet).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OUT_PATH = "content/food/ratings.json";
const OVERLAY_DIR = "content/food/places";
const REGIONS_PATH = "content/food/regions.json";
const EXPORT_DIR = ".food-export";

const CATEGORY = { RES: "restaurants", COF: "coffee", DES: "dessert", BAK: "bakeries", BAR: "bars" };
const STATUS = { CLOSED_PERMANENTLY: "closed", CLOSED_TEMPORARILY: "temporarily-closed" };
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const PHOTO_ID_LENGTH = 16;

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

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "Hyperion Coffee Co - Ann Arbor" → "Hyperion Coffee Co" when the suffix is the place's own city. */
export function stripCitySuffix(name, city) {
  const cityName = city.split(",")[0].trim();
  const suffix = new RegExp(`\\s*[-–|(]\\s*${escapeRegex(cityName)}\\)?\\s*$`, "i");
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

const isTea = (cuisine) => /\b(tea|boba|matcha)\b/i.test(cuisine);
const isCoffee = (cuisine) => /coffee/i.test(cuisine);

export function kindOf(place) {
  if (place.category !== "COF") return undefined;
  const cuisines = place.cuisines ?? [];
  return cuisines.some(isTea) && !cuisines.some(isCoffee) ? "tea" : "coffee";
}

/** [day (0 = Monday), open, close]; a null close means open around the clock. Split shifts stay separate. */
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
      const name = city.split(",")[0].trim();
      const slug = slugify(name);
      derived.set(slug, { slug, name, cities: [city] });
      return slug;
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
      ...(photo.caption?.trim() && { caption: photo.caption.trim() }),
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
      ? (p) => slugify(p.city.split(",")[0])
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

// ---------- upload (stub) ----------

function uploadPhotos(next, previous) {
  const known = new Set((previous?.places ?? []).flatMap((p) => (p.photos ?? []).map((ph) => ph.id)));
  const pending = next.places.flatMap((p) => (p.photos ?? []).map((ph) => ph.id)).filter((id) => !known.has(id));
  console.log(`\n--upload: ${pending.length} photos to resize (480/1200 webp) and push to R2. Not implemented yet.`);
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

function main() {
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
  if (new Set(photoIds).size !== new Set(raws.flatMap((r) => r.photo_ids ?? []).map((id) => data.assets[data.photos[id]?.asset_id]?.sha256)).size) {
    throw new Error("truncated photo ids collide; raise PHOTO_ID_LENGTH");
  }

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
  printDiff(diff(previous, next), !previous);
  if (upload) uploadPhotos(next, previous);
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) main();
