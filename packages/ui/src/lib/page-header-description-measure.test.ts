import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PAGE_HEADER_DESCRIPTION_LINES } from "./page-header-description-measure";

describe("PAGE_HEADER_DESCRIPTION_LINES", () => {
  it("clamps page header descriptions to two lines", () => {
    assert.equal(PAGE_HEADER_DESCRIPTION_LINES, 2);
  });
});
