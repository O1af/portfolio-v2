// Server-only: loads the generated ratings and the hand-written overlays and
// guides, merges them, and projects the small per-page views the routes need.
// Reach it only through the server functions in food-api.ts so the dataset
// never ends up in the client bundle.

import { allFoodGuides, allFoodPlaces } from "content-collections";
import type { FoodSearchEntry } from "@/components/search/search-index";
import ogManifest from "../../content/food/og.json";
import ratingsJson from "../../content/food/ratings.json";
import {
  areaOf,
  areasOf,
  assembleFood,
  cityName,
  IMAGE_HOST,
  regionPhrase,
  CATEGORY_LABEL,
  type Category,
  type Dish,
  type Guide,
  type Hours,
  type Kind,
  type Photo,
  type Place,
  type PlaceStatus,
  type RatingsFile,
  type Region,
} from "./food-core";

const data = assembleFood(ratingsJson as RatingsFile, allFoodPlaces, allFoodGuides, {
  includeDrafts: import.meta.env.DEV,
});

export const { places, guides, regions } = data;
export const bySlug = new Map(places.map((p) => [p.slug, p]));

/** Share-card URL for a page, from content/food/og.json (written by `pnpm food:og --upload`). */
const og = (key: string): string | undefined => {
  const hash = (ogManifest as Record<string, string>)[key];
  return hash ? `${IMAGE_HOST}/og/${hash}.jpg` : undefined;
};

const guideByPath = new Map(guides.map((g) => [g.path, g]));
const autoGuideOf = (p: Place) => guideByPath.get(`${p.region}/${p.category}`);
const guidesIn = (region: string) => guides.filter((g) => g.region.slug === region);
const inCategoryGuide = (p: Place) => autoGuideOf(p) !== undefined;
const byScoreDesc = (a: Place, b: Place) => b.score - a.score || (a.name < b.name ? -1 : 1);
const visible = places.filter((p) => !p.hidden);

// ---------- views ----------

export type RegionRef = { slug: string; name: string; phrase: string };

export type Row = {
  slug: string;
  name: string;
  rank: number;
  score: number;
  area?: string;
  kind?: Kind;
  /** A reviewed must-order dish, when there is one. */
  dish?: string;
  note?: string;
  photo?: string;
  hasPage: boolean;
  closed: boolean;
};

const toRow = (p: Place, rank: number): Row => ({
  slug: p.slug,
  name: p.name,
  rank,
  score: p.score,
  area: areaOf(p),
  kind: p.kind,
  dish: (p.dishes.find((d) => d.mustOrder) ?? p.dishes[0])?.name,
  note: p.note,
  photo: p.photos[0]?.id,
  hasPage: p.hasPage,
  closed: p.status === "closed",
});

const regionRef = (r: Region): RegionRef => ({ slug: r.slug, name: r.name, phrase: regionPhrase(r) });

/** "San Jose, Campbell, Santa Clara" for an area; "incl. Ypsilanti" for a city with suburbs folded in. */
function describeCities(region: Region): string | undefined {
  const names = region.cities.map(cityName);
  if (names.length < 2) return undefined;
  const isCity = names.includes(region.name);
  const extras = (isCity ? names.filter((n) => n !== region.name) : names).slice(0, 3);
  return `${isCity ? "incl. " : ""}${extras.join(", ")}`;
}

export type GuideLink = { segment: string; label: string; count: number; custom: boolean };

const guideLink = (g: Guide): GuideLink => ({
  segment: g.segment,
  label: g.label,
  count: g.places.length,
  custom: g.custom,
});

export type HubData = {
  og?: string;
  stats: { places: number; nines: number; photos: number; regions: number };
  regions: (RegionRef & { count: number; cities?: string; guides: GuideLink[] })[];
  /** Summary of /food/elsewhere, when there is anything there. */
  elsewhere?: { count: number; cities: string };
};

/** Regions too small for any guide (trips, one-off cities); they live on /food/elsewhere. */
const guidelessRegions = regions.filter((region) => guidesIn(region.slug).length === 0);
const elsewherePlaces = visible.filter((p) => guidelessRegions.some((r) => r.slug === p.region));

export const hub: HubData = {
  og: og("hub"),
  stats: {
    places: visible.length,
    nines: visible.filter((p) => p.score >= 9).length,
    photos: new Set(visible.flatMap((p) => p.photos.map((ph) => ph.id))).size,
    regions: new Set(guides.map((g) => g.region.slug)).size,
  },
  regions: regions
    .filter((region) => guidesIn(region.slug).length > 0)
    .map((region) => ({
      ...regionRef(region),
      count: visible.filter((p) => p.region === region.slug).length,
      cities: describeCities(region),
      guides: guidesIn(region.slug).map(guideLink),
    })),
  elsewhere: elsewherePlaces.length
    ? {
        count: elsewherePlaces.length,
        // Regions are ordered by how many places they have, so this leads with the biggest.
        cities: guidelessRegions
          .filter((r) => elsewherePlaces.some((p) => p.region === r.slug))
          .slice(0, 3)
          .map((r) => r.name)
          .join(" · "),
      }
    : undefined,
};

export type ElsewhereView = {
  og?: string;
  count: number;
  updated?: string;
  sections: (RegionRef & { rows: Row[] })[];
};

export function elsewhereView(): ElsewhereView | undefined {
  if (elsewherePlaces.length === 0) return undefined;
  const sections = guidelessRegions
    .map((region) => ({
      ...regionRef(region),
      rows: elsewherePlaces.filter((p) => p.region === region.slug).sort(byScoreDesc).map((p, i) => toRow(p, i + 1)),
    }))
    .filter((section) => section.rows.length > 0);
  return {
    og: og("elsewhere"),
    count: elsewherePlaces.length,
    updated: elsewherePlaces.map((p) => p.edited ?? p.visited).sort().at(-1),
    sections,
  };
}

export type RegionView = RegionRef & {
  og?: string;
  /** Places in categories too small for their own guide. */
  more: Row[];
  count: number;
  cities?: string;
  guides: GuideLink[];
  top: Row[];
  updated?: string;
};

export function regionView(slug: string): RegionView | undefined {
  const region = regions.find((r) => r.slug === slug);
  const regionGuides = guidesIn(slug);
  if (!region || regionGuides.length === 0) return undefined;
  const members = visible.filter((p) => p.region === slug);
  const top = members
    .filter((p) => p.status !== "closed")
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 10);
  return {
    ...regionRef(region),
    og: og(`region/${region.slug}`),
    count: members.length,
    cities: describeCities(region),
    guides: regionGuides.map(guideLink),
    top: top.map((p, i) => toRow(p, i + 1)),
    more: members.filter((p) => !inCategoryGuide(p)).sort(byScoreDesc).map((p, i) => toRow(p, i + 1)),
    updated: regionGuides.map((g) => g.updated).sort().at(-1),
  };
}

export type GuideView = {
  og?: string;
  region: RegionRef;
  segment: string;
  title: string;
  label: string;
  description: string;
  intro?: string;
  custom: boolean;
  category?: Category;
  updated?: string;
  noted: number;
  hasTea: boolean;
  areas: string[];
  rows: Row[];
  image?: Photo;
};

export function guideView(region: string, segment: string): GuideView | undefined {
  const guide = guideByPath.get(`${region}/${segment}`);
  if (!guide) return undefined;
  return {
    og: og(`guide/${guide.path}`),
    region: regionRef(guide.region),
    segment: guide.segment,
    title: guide.title,
    label: guide.label,
    description: guide.description,
    intro: guide.intro,
    custom: guide.custom,
    category: guide.category,
    updated: guide.updated,
    noted: guide.places.filter((p) => p.note).length,
    hasTea: guide.places.some((p) => p.kind === "tea"),
    areas: areasOf(guide.places),
    rows: guide.places.map((p, i) => toRow(p, i + 1)),
    image: guide.places.find((p) => p.photos.length)?.photos[0],
  };
}

type Neighbor = { slug: string; name: string; rank: number };

export type PlaceView = {
  og?: string;
  slug: string;
  name: string;
  score: number;
  category: Category;
  kind?: Kind;
  cuisines?: string[];
  city: string;
  /** hasPage: the region has its own page; otherwise the place is listed on /food/elsewhere. */
  region: RegionRef & { hasPage: boolean };
  neighborhood?: string;
  area?: string;
  lat: number;
  lng: number;
  placeId?: string;
  website?: string;
  phone?: string;
  hours?: Hours[];
  status?: PlaceStatus;
  visited?: string;
  edited?: string;
  note?: string;
  dishes: Dish[];
  photos: Photo[];
  /** False for photo-only pages: rendered, linked, but kept out of search results. */
  indexable: boolean;
  /** Position in the region × category guide, when that guide exists. */
  guide?: { segment: string; label: string; rank: number; total: number; prev?: Neighbor; next?: Neighbor };
};

/** Nearest place in `list` from `index` stepping by `step` that has a page. */
function neighbor(list: Place[], index: number, step: 1 | -1): Neighbor | undefined {
  for (let i = index + step; i >= 0 && i < list.length; i += step) {
    if (list[i].hasPage) return { slug: list[i].slug, name: list[i].name, rank: i + 1 };
  }
  return undefined;
}

export function placeView(slug: string): PlaceView | undefined {
  const place = bySlug.get(slug);
  if (!place?.hasPage) return undefined;
  const region = regions.find((r) => r.slug === place.region)!;
  const guide = autoGuideOf(place);
  const index = guide?.places.indexOf(place) ?? -1;
  return {
    og: og(`place/${place.slug}`),
    slug: place.slug,
    name: place.name,
    score: place.score,
    category: place.category,
    kind: place.kind,
    cuisines: place.cuisines,
    city: place.city,
    region: { ...regionRef(region), hasPage: guidesIn(region.slug).length > 0 },
    neighborhood: place.neighborhood,
    area: areaOf(place),
    lat: place.lat,
    lng: place.lng,
    placeId: place.placeId,
    website: place.website,
    phone: place.phone,
    hours: place.hours,
    status: place.status,
    visited: place.visited,
    edited: place.edited,
    note: place.note,
    dishes: place.dishes,
    photos: place.photos,
    indexable: place.indexable,
    guide:
      guide && index >= 0
        ? {
            segment: guide.segment,
            label: guide.label,
            rank: index + 1,
            total: guide.places.length,
            prev: neighbor(guide.places, index, -1),
            next: neighbor(guide.places, index, 1),
          }
        : undefined,
  };
}

/** What ⌘K searches: every guide and every place with a page. */
export const foodSearch: FoodSearchEntry[] = [
  ...guides.map((g) => ({
    kind: "guide" as const,
    region: g.region.slug,
    segment: g.segment,
    title: g.title,
    count: g.places.length,
  })),
  ...visible
    .filter((p) => p.hasPage)
    .map((p) => ({
      kind: "place" as const,
      slug: p.slug,
      name: p.name,
      subtitle: [areaOf(p) ?? cityName(p.city), CATEGORY_LABEL[p.category], p.score.toFixed(1)].join(" · "),
      keywords: [cityName(p.city), ...(p.neighborhood ? [p.neighborhood] : []), ...(p.cuisines ?? [])],
    })),
];
