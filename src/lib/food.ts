// Server-only: loads the generated ratings and the hand-written overlays and
// merges them. Import this only from inside server functions so the full
// dataset never ends up in the client bundle.

import { allFoodPlaces } from "content-collections";
import ratingsJson from "../../content/food/ratings.json";
import {
  buildGuides,
  mergePlace,
  neighborhoodsOf,
  type Guide,
  type Overlay,
  type Place,
  type RatingsFile,
  type Region,
} from "./food-core";

const ratings = ratingsJson as RatingsFile;

const overlays = new Map<number, Overlay>(
  allFoodPlaces.map((doc) => [
    doc.id,
    {
      id: doc.id,
      status: doc.status,
      dishes: doc.dishes?.map((d) => ({ name: d.name, ...(d.must_order && { mustOrder: true }) })),
      updated: doc.updated?.toISOString().slice(0, 10),
      body: doc.content,
    },
  ])
);

export const places: Place[] = ratings.places.map((source) => mergePlace(source, overlays.get(source.id)));
export const bySlug = new Map(places.map((p) => [p.slug, p]));
export const regions: Region[] = ratings.regions;
export const guides: Guide[] = buildGuides(places, regions);
export const guideBySlug = new Map(guides.map((g) => [g.slug, g]));
export const neighborhoods = (region: string) => neighborhoodsOf(places, region);
export const hasPage = (slug: string) => bySlug.get(slug)?.hasPage ?? false;

export type HubRegion = {
  slug: string;
  name: string;
  count: number;
  /** Subtitle after the count: the cities folded into this region, if any. */
  cities?: string;
  guides: { slug: string; label: string; count: number }[];
};

export type HubData = {
  stats: { places: number; nines: number; photos: number; regions: number };
  regions: HubRegion[];
};

const visible = places.filter((p) => !p.hidden);

/** "San Jose, Campbell, Santa Clara" for an area; "incl. Ypsilanti" for a city with suburbs folded in. */
function describeCities(region: Region): string | undefined {
  const names = region.cities.map((c) => c.split(",")[0]);
  if (names.length < 2) return undefined;
  const isCity = names.includes(region.name);
  const extras = (isCity ? names.filter((n) => n !== region.name) : names).slice(0, 3);
  return `${isCity ? "incl. " : ""}${extras.join(", ")}`;
}

/** Everything the /food hub renders. Small enough to ship to the client. */
export const hub: HubData = {
  stats: {
    places: visible.length,
    nines: visible.filter((p) => p.score >= 9).length,
    photos: visible.reduce((n, p) => n + p.photos.length, 0),
    regions: new Set(guides.map((g) => g.region.slug)).size,
  },
  regions: regions
    .filter((region) => guides.some((g) => g.region.slug === region.slug))
    .map((region) => ({
      slug: region.slug,
      name: region.name,
      count: visible.filter((p) => p.region === region.slug).length,
      cities: describeCities(region),
      guides: guides
        .filter((g) => g.region.slug === region.slug)
        .map((g) => ({ slug: g.slug, label: g.label, count: g.places.length })),
    })),
};
