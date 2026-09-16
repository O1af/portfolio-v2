import { describe, expect, it } from "vitest";
import { buildGuides, mergePlace, type Overlay, type Region, type SourcePlace } from "./food-core";

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

  it("overlay dishes replace imported dishes only when provided", () => {
    expect(mergePlace(source(), overlay()).dishes).toEqual([{ name: "latte" }]);
    expect(mergePlace(source(), overlay({ dishes: [{ name: "mocha", mustOrder: true }] })).dishes).toEqual([
      { name: "mocha", mustOrder: true },
    ]);
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
