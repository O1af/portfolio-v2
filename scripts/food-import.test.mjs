import assert from "node:assert/strict";
import { test } from "node:test";
import { assignSlugs } from "./food-import.mjs";

test("adding a same-name branch preserves published URLs across imports", () => {
  const existing = { id: 1, slug: "madman-espresso", name: "Madman Espresso", city: "New York, NY", neighborhood: "Garment District" };
  const added = { id: 2, name: "Madman Espresso", city: "New York, NY", neighborhood: "Lower East Side" };
  const first = assignSlugs([{ ...existing }, { ...added }], [existing]);
  assert.equal(first[0].slug, "madman-espresso");
  assert.equal(first[1].slug, "madman-espresso-lower-east-side");
  assert.deepEqual(assignSlugs([{ ...existing }, { ...added }], first), first);
});

test("new places cannot claim another place's preserved URL", () => {
  const existing = { id: 1, slug: "coffee-shop", name: "Renamed Cafe", city: "New York, NY" };
  const added = { id: 2, name: "Coffee Shop", city: "New York, NY" };
  const result = assignSlugs([{ ...added }, { ...existing }], [existing]);
  assert.equal(result[0].slug, "coffee-shop-2");
  assert.equal(result[1].slug, "coffee-shop");
});
