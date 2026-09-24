// Pure data model for the food section: types, the overlay merge, guide
// derivation and filters. No imports of generated content, so it can be unit
// tested and loaded by the sitemap script.

export type Category = "restaurants" | "coffee" | "dessert" | "bakeries" | "bars";
export type Kind = "coffee" | "tea";
export type PlaceStatus = "closed" | "temporarily-closed";
/** [day (0 = Sunday), open "HH:MM", close "HH:MM" ("24:00" = open until midnight or later)] */
export type Hours = [day: number, open: string, close: string];
/** A photo on the image host; w × h is the largest variant's size. */
export type Photo = { id: string; caption?: string; w?: number; h?: number };
export type PhotoVariant = "sq128" | "sq" | "480" | "800" | "1200";

export const IMAGE_HOST = "https://img.olafdsouza.com";

/** Keep in sync with VARIANTS in scripts/food-import.mjs. */
export const photoUrl = (id: string, variant: PhotoVariant) => `${IMAGE_HOST}/food/${id}-${variant}.webp`;
export type Dish = { name: string; mustOrder?: boolean };

/** One record in content/food/ratings.json. Generated; never hand-edited. */
export type SourcePlace = {
  id: number;
  slug: string;
  name: string;
  category: Category;
  kind?: Kind;
  score: number;
  city: string;
  region: string;
  neighborhood?: string;
  /** Filter value when it isn't the neighborhood: the city in an area region, or a suburb. */
  area?: string;
  borough?: string;
  lat: number;
  lng: number;
  placeId?: string;
  website?: string;
  phone?: string;
  cuisines?: string[];
  hours?: Hours[];
  status?: PlaceStatus;
  visited?: string;
  note?: string;
  /** Prefilled from photo captions; unreviewed, so never published directly. */
  dishes?: Dish[];
  photos?: Photo[];
};

export type Region = { slug: string; name: string; cities: string[]; count: number };

export type RatingsFile = { exportedAt: string; regions: Region[]; places: SourcePlace[] };

export type OverlayStatus = "draft" | "done" | "hidden";

/** A hand-written content/food/places/<slug>.md, parsed. */
export type Overlay = {
  id: number;
  status: OverlayStatus;
  dishes?: Dish[];
  /** ISO date of the last edit (git, falling back to the `updated` frontmatter). */
  updated?: string;
  body: string;
};

export type Place = Omit<SourcePlace, "dishes" | "photos"> & {
  /** Reviewed dishes from the overlay only. */
  dishes: Dish[];
  photos: Photo[];
  hidden: boolean;
  hasPage: boolean;
  /** ISO date of the last hand edit, when an overlay exists. */
  edited?: string;
};

export const CATEGORIES: Category[] = ["restaurants", "coffee", "dessert", "bakeries", "bars"];

export const CATEGORY_LABEL: Record<Category, string> = {
  restaurants: "Restaurants",
  coffee: "Coffee",
  dessert: "Dessert",
  bakeries: "Bakeries",
  bars: "Bars",
};

const CATEGORY_NOUN: Record<Category, string> = {
  restaurants: "restaurant",
  coffee: "coffee shop",
  dessert: "dessert spot",
  bakeries: "bakery",
  bars: "bar",
};

export const GUIDE_MIN_PLACES = 8;

export const cityName = (city: string) => city.split(",")[0].trim();

/** What the neighborhood filter and row subtitles use. */
export const areaOf = (place: Pick<SourcePlace, "area" | "neighborhood">) => place.area ?? place.neighborhood;

/**
 * Overlay fields win field by field. The score (and everything else only the
 * ratings source knows) is never touched: the overlay type has no score.
 */
export function mergePlace(source: SourcePlace, overlay?: Overlay): Place {
  const note = overlay?.status === "done" ? overlay.body.trim() || undefined : source.note;
  const hidden = overlay?.status === "hidden";
  const photos = source.photos ?? [];
  return {
    ...source,
    note,
    dishes: overlay?.dishes ?? [],
    photos,
    hidden,
    hasPage: !hidden && (photos.length > 0 || Boolean(note)),
    edited: overlay?.updated,
  };
}

// ---------- guides ----------

export type GuideFilter = {
  category?: Category;
  kind?: Kind;
  /** Any match, case-insensitive, against the place's cuisines. */
  cuisines?: string[];
  /** City names without the state, e.g. "San Jose". */
  cities?: string[];
  /** Matched against the neighborhood or area. */
  neighborhoods?: string[];
  minScore?: number;
};

/** A hand-written content/food/guides/<slug>.md, parsed. */
export type CustomGuideDef = {
  slug: string;
  region: string;
  title: string;
  description: string;
  /** Rendered HTML of the markdown body. */
  intro: string;
  /** Explicit, ordered place slugs; wins over `filter`. */
  places?: string[];
  filter?: GuideFilter;
  limit?: number;
  updated?: string;
};

export type Guide = {
  /** `${region}/${segment}`: the path under /food. */
  path: string;
  segment: string;
  region: Region;
  /** Set for the automatic region × category guides. */
  category?: Category;
  custom: boolean;
  title: string;
  /** Short name for lists and breadcrumbs. */
  label: string;
  description: string;
  intro?: string;
  places: Place[];
  /** ISO date of the newest visit or edit among its places (or the guide file itself). */
  updated?: string;
};

/** Guides sort by score; closed places sink to the bottom. Plain string order breaks ties (no ICU, it's hot). */
export function compareForGuide(a: Place, b: Place): number {
  const closedA = a.status === "closed" ? 1 : 0;
  const closedB = b.status === "closed" ? 1 : 0;
  return closedA - closedB || b.score - a.score || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}

const lower = (values?: string[]) => values?.map((v) => v.toLowerCase());

export function matchesFilter(place: Place, filter: GuideFilter): boolean {
  const cuisines = lower(filter.cuisines);
  const cities = lower(filter.cities);
  const areas = lower(filter.neighborhoods);
  const area = areaOf(place)?.toLowerCase();
  return (
    (!filter.category || place.category === filter.category) &&
    (!filter.kind || place.kind === filter.kind) &&
    (!cuisines || (place.cuisines ?? []).some((c) => cuisines.includes(c.toLowerCase()))) &&
    (!cities || cities.includes(cityName(place.city).toLowerCase())) &&
    (!areas ||
      areas.includes(area ?? "") ||
      areas.includes(place.neighborhood?.toLowerCase() ?? "")) &&
    (filter.minScore === undefined || place.score >= filter.minScore)
  );
}

const latest = (dates: (string | undefined)[]) =>
  dates.reduce<string | undefined>((max, d) => (d && (!max || d > max) ? d : max), undefined);

const newestDate = (places: Place[]) => latest(places.map((p) => latest([p.edited, p.visited])));

function autoGuide(region: Region, category: Category, places: Place[]): Guide {
  const hasTea = category === "coffee" && places.some((p) => p.kind === "tea");
  const noun = hasTea ? "coffee, tea and boba spot" : CATEGORY_NOUN[category];
  return {
    path: `${region.slug}/${category}`,
    segment: category,
    region,
    category,
    custom: false,
    title: `Best ${category} in ${region.name}`,
    label: hasTea ? "Coffee & tea" : CATEGORY_LABEL[category],
    description: `Every ${noun} I've rated in ${region.name}, ranked by score.`,
    places,
    updated: newestDate(places),
  };
}

function customGuide(def: CustomGuideDef, region: Region, visible: Place[], bySlug: Map<string, Place>): Guide {
  let members: Place[];
  if (def.places) {
    members = def.places.map((slug) => {
      const place = bySlug.get(slug);
      if (!place) throw new Error(`Guide "${def.slug}" lists unknown place "${slug}"`);
      return place;
    });
    members = members.filter((p) => !p.hidden);
  } else {
    const filter = def.filter ?? {};
    members = visible.filter((p) => p.region === region.slug && matchesFilter(p, filter));
  }
  if (def.limit) members = members.slice(0, def.limit);
  return {
    path: `${region.slug}/${def.slug}`,
    segment: def.slug,
    region,
    custom: true,
    title: def.title,
    label: def.title,
    description: def.description,
    intro: def.intro,
    places: members,
    updated: latest([def.updated, newestDate(members)]),
  };
}

/** Automatic region × category guides (≥ GUIDE_MIN_PLACES places), then hand-written ones. */
export function buildGuides(places: Place[], regions: Region[], customs: CustomGuideDef[] = []): Guide[] {
  // Sort once, then bucket: every bucket inherits guide order without its own sort.
  const visible = places.filter((p) => !p.hidden).sort(compareForGuide);
  const buckets = new Map<string, Place[]>();
  for (const p of visible) {
    const key = `${p.region}/${p.category}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(p);
    else buckets.set(key, [p]);
  }
  const guides: Guide[] = [];
  for (const region of regions) {
    for (const category of CATEGORIES) {
      const members = buckets.get(`${region.slug}/${category}`) ?? [];
      if (members.length >= GUIDE_MIN_PLACES) guides.push(autoGuide(region, category, members));
    }
  }

  const regionBySlug = new Map(regions.map((r) => [r.slug, r]));
  const bySlug = new Map(places.map((p) => [p.slug, p]));
  const taken = new Set(guides.map((g) => g.path));
  for (const def of customs) {
    const region = regionBySlug.get(def.region);
    if (!region) throw new Error(`Guide "${def.slug}" names unknown region "${def.region}"`);
    if ((CATEGORIES as string[]).includes(def.slug) || taken.has(`${region.slug}/${def.slug}`)) {
      throw new Error(`Guide "${def.slug}" collides with another guide in ${region.name}`);
    }
    const guide = customGuide(def, region, visible, bySlug);
    taken.add(guide.path);
    guides.push(guide);
  }
  return guides;
}

export function areasOf(places: Place[]): string[] {
  const names = new Set<string>();
  for (const p of places) {
    const area = areaOf(p);
    if (area) names.add(area);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

// ---------- list filters (search params shared by list and map) ----------

export type ListFilters = { kind?: Kind; nbhd?: string; min?: number };

/** Validates untrusted search params; anything malformed is dropped rather than erroring. */
export function parseListFilters(search: Record<string, unknown>): ListFilters {
  const filters: ListFilters = {};
  if (search.kind === "coffee" || search.kind === "tea") filters.kind = search.kind;
  if (typeof search.nbhd === "string" && search.nbhd.trim()) filters.nbhd = search.nbhd.trim().slice(0, 80);
  const min = Number(search.min);
  if (Number.isInteger(min) && min >= 1 && min <= 10) filters.min = min;
  return filters;
}

export function applyListFilters<T extends { kind?: Kind; area?: string; score: number }>(
  rows: T[],
  filters: ListFilters
): T[] {
  return rows.filter(
    (r) =>
      (!filters.kind || r.kind === filters.kind) &&
      (!filters.nbhd || r.area === filters.nbhd) &&
      (!filters.min || r.score >= filters.min)
  );
}
