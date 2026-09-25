import { describe, expect, it } from "vitest";
import {
  applyListFilters,
  buildGuides,
  mergePlace,
  parseListFilters,
  type CustomGuideDef,
  type Overlay,
  type Region,
  type SourcePlace,
} from "./food-core";

const source = (over: Partial<SourcePlace> = {}): SourcePlace => ({
  id: 1,
  slug: "place",
  name: "Place",
  category: "coffee",
  kind: "coffee",
  score: 8.4,
  city: "Ann Arbor, MI",
  region: "ann-arbor",
  lat: 0,
  lng: 0,
  note: "imported note",
  dishes: [{ name: "latte" }],
  photos: [{ id: "abc" }],
  ...over,
});

const overlay = (over: Partial<Overlay> = {}): Overlay => ({ id: 1, status: "draft", body: "", ...over });

describe("mergePlace", () => {
  it("keeps the imported note while the overlay is a draft", () => {
    expect(mergePlace(source(), overlay({ body: "my draft" })).note).toBe("imported note");
  });

  it("publishes the overlay body when done, and an empty body means no note", () => {
    expect(mergePlace(source(), overlay({ status: "done", body: "my take" })).note).toBe("my take");
    expect(mergePlace(source({ photos: undefined }), overlay({ status: "done" })).note).toBeUndefined();
  });

  it("never lets an overlay change the score", () => {
    const sneaky = { ...overlay({ status: "done" }), score: 10 } as Overlay;
    expect(mergePlace(source(), sneaky).score).toBe(8.4);
  });

  it("publishes only reviewed dishes from the overlay, never caption prefills", () => {
    expect(mergePlace(source()).dishes).toEqual([]);
    expect(mergePlace(source(), overlay()).dishes).toEqual([]);
    expect(mergePlace(source(), overlay({ dishes: [{ name: "mocha", mustOrder: true }] })).dishes).toEqual([
      { name: "mocha", mustOrder: true },
    ]);
  });

  it("indexes only pages that carry a note", () => {
    expect(mergePlace(source()).indexable).toBe(true);
    expect(mergePlace(source({ note: undefined })).indexable).toBe(false);
    expect(mergePlace(source(), overlay({ status: "done", body: "" })).indexable).toBe(false);
  });

  it("gives a page only to places with a photo or a note, never to hidden ones", () => {
    expect(mergePlace(source({ photos: undefined, note: undefined })).hasPage).toBe(false);
    expect(mergePlace(source({ photos: undefined })).hasPage).toBe(true);
    expect(mergePlace(source({ note: undefined })).hasPage).toBe(true);
    expect(mergePlace(source(), overlay({ status: "hidden" })).hasPage).toBe(false);
  });
});

describe("buildGuides", () => {
  const region: Region = { slug: "ann-arbor", name: "Ann Arbor", cities: ["Ann Arbor, MI"], count: 0 };
  const many = (n: number, over: Partial<SourcePlace> = {}) =>
    Array.from({ length: n }, (_, i) => mergePlace(source({ id: i, slug: `p${i}`, score: 9 - i * 0.1, ...over })));

  it("requires at least eight places per region and category", () => {
    expect(buildGuides(many(7), [region])).toHaveLength(0);
    expect(buildGuides(many(8), [region])).toHaveLength(1);
  });

  it("ignores hidden places and sinks closed ones to the bottom", () => {
    const places = [
      ...many(8),
      mergePlace(source({ id: 50, slug: "closed", score: 10, status: "closed" })),
      mergePlace(source({ id: 51, slug: "hidden", score: 10 }), overlay({ id: 51, status: "hidden" })),
    ];
    const [guide] = buildGuides(places, [region]);
    expect(guide.places.map((p) => p.slug)).not.toContain("hidden");
    expect(guide.places.at(-1)?.slug).toBe("closed");
    expect(guide.places[0].score).toBe(9);
  });

  it("labels coffee guides with tea when any tea spot is present", () => {
    expect(buildGuides(many(8), [region])[0].label).toBe("Coffee");
    expect(buildGuides(many(8, { kind: "tea" }), [region])[0].label).toBe("Coffee & tea");
  });
});

describe("custom guides", () => {
  const region: Region = { slug: "south-bay", name: "South Bay", cities: ["San Jose, CA", "Campbell, CA"], count: 0 };
  const places = [
    mergePlace(source({ id: 1, slug: "taqueria", category: "restaurants", kind: undefined, region: "south-bay", city: "San Jose, CA", cuisines: ["Mexican", "Tacos"], score: 9.1 })),
    mergePlace(source({ id: 2, slug: "burrito", category: "restaurants", kind: undefined, region: "south-bay", city: "Campbell, CA", cuisines: ["Mexican"], score: 9.5 })),
    mergePlace(source({ id: 3, slug: "pho", category: "restaurants", kind: undefined, region: "south-bay", city: "San Jose, CA", cuisines: ["Vietnamese"], score: 9.9 })),
  ];
  const def = (over: Partial<CustomGuideDef>): CustomGuideDef => ({
    slug: "mexican",
    region: "south-bay",
    title: "Best Mexican in San Jose",
    description: "",
    intro: "",
    ...over,
  });

  it("selects by filter, ranked by score, within the region", () => {
    const [guide] = buildGuides(places, [region], [def({ filter: { cuisines: ["mexican"], cities: ["San Jose"] } })]);
    expect(guide.path).toBe("south-bay/mexican");
    expect(guide.places.map((p) => p.slug)).toEqual(["taqueria"]);
  });

  it("keeps a hand-picked order and applies the limit", () => {
    const [guide] = buildGuides(places, [region], [def({ places: ["taqueria", "pho", "burrito"], limit: 2 })]);
    expect(guide.places.map((p) => p.slug)).toEqual(["taqueria", "pho"]);
  });

  it("rejects unknown places and slugs that collide with a category", () => {
    expect(() => buildGuides(places, [region], [def({ places: ["nope"] })])).toThrow(/unknown place/);
    expect(() => buildGuides(places, [region], [def({ slug: "coffee" })])).toThrow(/collides/);
  });
});

describe("list filters", () => {
  it("keeps valid params and drops malformed ones", () => {
    expect(parseListFilters({ kind: "tea", nbhd: " Kerrytown ", min: "9" })).toEqual({ kind: "tea", nbhd: "Kerrytown", min: 9 });
    expect(parseListFilters({ kind: "wine", min: "11", nbhd: 3 })).toEqual({});
  });

  it("filters rows by kind, area and minimum score", () => {
    const rows = [
      { kind: "tea" as const, area: "Kerrytown", score: 9.2 },
      { kind: "coffee" as const, area: "Kerrytown", score: 8.1 },
      { kind: "coffee" as const, area: "Northside", score: 9.6 },
    ];
    expect(applyListFilters(rows, { kind: "coffee", min: 9 })).toEqual([rows[2]]);
    expect(applyListFilters(rows, { nbhd: "Kerrytown" })).toEqual([rows[0], rows[1]]);
  });
});
