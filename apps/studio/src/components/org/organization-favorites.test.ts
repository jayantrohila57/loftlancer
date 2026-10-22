import assert from "node:assert/strict";
import test from "node:test";
import { toggleOrganizationFavorite } from "./use-organization-favorites";

test("organization favorites can contain at most three organizations", () => {
  assert.deepEqual(toggleOrganizationFavorite([], "one"), ["one"]);
  assert.deepEqual(toggleOrganizationFavorite(["one", "two", "three"], "two"), [
    "one",
    "three",
  ]);
  assert.equal(
    toggleOrganizationFavorite(["one", "two", "three"], "four"),
    null,
  );
});
