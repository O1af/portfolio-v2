// Structured data and meta helpers for the food pages.

import { personalInfo, siteUrl } from "@/components/Info";
import { cityName, photoUrl, type Category, type Photo } from "./food-core";
import type { GuideView, PlaceView, Row } from "./food";
import { buildSocialMeta } from "./seo";

export const foodUrl = (path = "") => `${siteUrl}/food${path}`;
export const placeUrl = (slug: string) => foodUrl(`/place/${slug}`);
export const guideUrl = (region: string, segment: string) => foodUrl(`/${region}/${segment}`);

const author = { "@type": "Person", name: personalInfo.name, url: siteUrl };

/** schema.org subtype of FoodEstablishment per category. */
const SCHEMA_TYPE: Record<Category, string> = {
  restaurants: "Restaurant",
  coffee: "CafeOrCoffeeShop",
  dessert: "FoodEstablishment",
  bakeries: "Bakery",
  bars: "BarOrPub",
};

export function socialImage(photo?: Photo) {
  return photo ? photoUrl(photo.id, "1200") : `${siteUrl}${personalInfo.profileImage}`;
}

export function foodMeta(input: { title: string; description: string; url: string; image?: Photo; type?: "website" | "article" }) {
  const image = socialImage(input.image);
  return [
    { title: input.title },
    { name: "description", content: input.description },
    { name: "author", content: personalInfo.name },
    ...buildSocialMeta({
      title: input.title,
      description: input.description,
      url: input.url,
      image,
      siteName: personalInfo.name,
      type: input.type,
    }),
    ...(input.image?.w && input.image.h
      ? [
          { property: "og:image:width", content: String(input.image.w) },
          { property: "og:image:height", content: String(input.image.h) },
        ]
      : []),
  ];
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", url: siteUrl }, { name: "Food", url: foodUrl() }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Linked rows point at their page; score-only rows are named inline. */
export function itemList(name: string, url: string, rows: Row[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: rows.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: rows.map((row, i) =>
      row.hasPage
        ? { "@type": "ListItem", position: i + 1, url: placeUrl(row.slug), name: row.name }
        : { "@type": "ListItem", position: i + 1, name: row.name }
    ),
  };
}

export function guideSchema(guide: GuideView, url: string) {
  return {
    ...itemList(guide.title, url, guide.rows),
    description: guide.description,
    author,
    ...(guide.updated && { dateModified: guide.updated }),
  };
}

export function placeSchema(place: PlaceView, url: string) {
  const [locality, state] = place.city.split(",").map((s) => s.trim());
  return {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[place.category],
    "@id": `${url}#place`,
    name: place.name,
    url: place.website ?? url,
    ...(place.photos.length && { image: place.photos.map((ph) => photoUrl(ph.id, "1200")) }),
    ...(place.phone && { telephone: place.phone }),
    ...(place.cuisines?.length && place.category === "restaurants" && { servesCuisine: place.cuisines }),
    address: {
      "@type": "PostalAddress",
      addressLocality: locality ?? cityName(place.city),
      ...(state && { addressRegion: state }),
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng },
    ...(place.placeId && { hasMap: `https://www.google.com/maps/search/?api=1&query_place_id=${place.placeId}` }),
    review: {
      "@type": "Review",
      author,
      url,
      reviewRating: { "@type": "Rating", ratingValue: place.score.toFixed(1), bestRating: "10", worstRating: "0" },
      ...(place.note && { reviewBody: place.note }),
      ...(place.visited && { datePublished: place.visited }),
      ...((place.edited ?? place.visited) && { dateModified: place.edited ?? place.visited }),
    },
  };
}
