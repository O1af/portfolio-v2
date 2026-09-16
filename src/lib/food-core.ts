// Pure data model for the food section: types, the overlay merge, and guide
// derivation. No imports of generated content so it can be unit tested.

export type Category = "restaurants" | "coffee" | "dessert" | "bakeries" | "bars";
export type Kind = "coffee" | "tea";
export type PlaceStatus = "closed" | "temporarily-closed";
/** [day (0 = Monday), open "HH:MM", close "HH:MM" ("24:00" = open all night)] */
export type Hours = [day: number, open: string, close: string];
export type Photo = { id: string; caption?: string };
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
  updated?: string;
  body: string;
};

export type Place = Omit<SourcePlace, "dishes" | "photos"> & {
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

export const GUIDE_MIN_PLACES = 8;

/**
 * Overlay fields win field by field. The score (and everything else that only
 * the ratings source knows) is never touched: the overlay type has no score.
 */
export function mergePlace(source: SourcePlace, overlay?: Overlay): Place {
  const note = overlay?.status === "done" ? overlay.body.trim() || undefined : source.note;
  const hidden = overlay?.status === "hidden";
  const photos = source.photos ?? [];
  return {
    ...source,
    note,
    dishes: overlay?.dishes ?? source.dishes ?? [],
    photos,
    hidden,
    hasPage: !hidden && (photos.length > 0 || Boolean(note)),
    edited: overlay?.updated,
  };
}

export type Guide = {
  /** `${region}/${category}`, also the URL path under /food. */
  slug: string;
  region: Region;
  category: Category;
  title: string;
  label: string;
  places: Place[];
};

/** Guides sort by score; closed places sink to the bottom. */
export function compareForGuide(a: Place, b: Place): number {
  const closedA = a.status === "closed" ? 1 : 0;
  const closedB = b.status === "closed" ? 1 : 0;
  return closedA - closedB || b.score - a.score || a.name.localeCompare(b.name);
}

function guideLabel(category: Category, places: Place[]): string {
  if (category === "coffee" && places.some((p) => p.kind === "tea")) return "Coffee & tea";
  return CATEGORY_LABEL[category];
}

export function buildGuides(places: Place[], regions: Region[]): Guide[] {
  const visible = places.filter((p) => !p.hidden);
  const guides: Guide[] = [];
  for (const region of regions) {
    for (const category of CATEGORIES) {
      const members = visible
        .filter((p) => p.region === region.slug && p.category === category)
        .sort(compareForGuide);
      if (members.length < GUIDE_MIN_PLACES) continue;
      guides.push({
        slug: `${region.slug}/${category}`,
        region,
        category,
        title: `Best ${category} in ${region.name}`,
        label: guideLabel(category, members),
        places: members,
      });
    }
  }
  return guides;
}

export function neighborhoodsOf(places: Place[], region: string): string[] {
  const names = new Set<string>();
  for (const p of places) if (p.region === region && p.neighborhood && !p.hidden) names.add(p.neighborhood);
  return [...names].sort((a, b) => a.localeCompare(b));
}
