import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAddSidebarFavorite,
  MAX_SIDEBAR_FAVORITES,
} from "./sidebar-favorites";

describe("sidebar favorite limit", () => {
  it("allows up to three favorites", () => {
    assert.equal(MAX_SIDEBAR_FAVORITES, 3);
    assert.equal(canAddSidebarFavorite(0, false), true);
    assert.equal(canAddSidebarFavorite(2, false), true);
    assert.equal(canAddSidebarFavorite(3, false), false);
  });

  it("keeps an existing favorite removable at the limit", () => {
    assert.equal(canAddSidebarFavorite(3, true), true);
  });
});
