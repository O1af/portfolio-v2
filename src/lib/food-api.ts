// Server functions for the food routes. Each returns only what one page renders;
// the dynamic import keeps the full dataset in the server bundle.

import { createServerFn } from "@tanstack/react-start";
import type { FoodSearchEntry } from "@/components/search/search-index";
import type { ElsewhereView, GuideView, HubData, PlaceView, RegionView } from "./food";

const slugInput = (data: unknown) => {
  const value = (data as { slug?: unknown })?.slug;
  if (typeof value !== "string") throw new Error("slug required");
  return { slug: value };
};

const guideInput = (data: unknown) => {
  const { region, guide } = (data ?? {}) as { region?: unknown; guide?: unknown };
  if (typeof region !== "string" || typeof guide !== "string") throw new Error("region and guide required");
  return { region, guide };
};

export const getHub = createServerFn({ method: "GET" }).handler(
  async (): Promise<HubData> => (await import("./food")).hub
);

export const getRegion = createServerFn({ method: "GET" })
  .validator(slugInput)
  .handler(async ({ data }): Promise<RegionView | null> => (await import("./food")).regionView(data.slug) ?? null);

export const getGuide = createServerFn({ method: "GET" })
  .validator(guideInput)
  .handler(
    async ({ data }): Promise<GuideView | null> => (await import("./food")).guideView(data.region, data.guide) ?? null
  );

export const getPlace = createServerFn({ method: "GET" })
  .validator(slugInput)
  .handler(async ({ data }): Promise<PlaceView | null> => (await import("./food")).placeView(data.slug) ?? null);

export const getFoodSearch = createServerFn({ method: "GET" }).handler(
  async (): Promise<FoodSearchEntry[]> => (await import("./food")).foodSearch
);

export const getElsewhere = createServerFn({ method: "GET" }).handler(
  async (): Promise<ElsewhereView | null> => (await import("./food")).elsewhereView() ?? null
);
