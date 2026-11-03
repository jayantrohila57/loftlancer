import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  pageHeaderDescriptionGridActionClass,
  pageHeaderDescriptionGridDescClass,
  pageHeaderDescriptionGridTitleClass,
} from "../src/utils/patterns.page-header-grid-classes.utils";

describe("pageHeaderDescriptionGridTitleClass", () => {
  it("does not offset title when there is no back control", () => {
    assert.equal(
      pageHeaderDescriptionGridTitleClass(false),
      "[grid-area:title]",
    );
  });

  it("offsets title for the back column on md+ when back is shown", () => {
    assert.match(pageHeaderDescriptionGridTitleClass(true), /md:col-start-2/);
  });
});

describe("pageHeaderDescriptionGridDescClass", () => {
  it("does not offset description when there is no back control", () => {
    assert.doesNotMatch(pageHeaderDescriptionGridDescClass(false), /col-start/);
  });
});

describe("pageHeaderDescriptionGridActionClass", () => {
  it("does not use md:col-start-3 without a back column", () => {
    assert.doesNotMatch(
      pageHeaderDescriptionGridActionClass(false),
      /col-start-3/,
    );
  });
});
