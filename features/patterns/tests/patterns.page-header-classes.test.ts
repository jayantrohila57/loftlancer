import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  layoutGapClass,
  layoutPageHeaderRowClass,
} from "@features/shell/utils/shell.layout-spacing.utils";
import {
  pageHeaderActionsClass,
  pageHeaderMetaRowClass,
  pageHeaderRootClass,
  pageHeaderTopRowClass,
} from "../src/utils/patterns.page-header-classes.utils";

describe("pageHeaderTopRowClass", () => {
  it("uses the shared layout page header row scale (h-12, gap-2)", () => {
    assert.equal(pageHeaderTopRowClass, layoutPageHeaderRowClass);
    assert.match(pageHeaderTopRowClass, /min-h-12/);
    assert.match(pageHeaderTopRowClass, /gap-2/);
  });
});

describe("pageHeaderActionsClass", () => {
  it("keeps primary actions on the h-8 control row", () => {
    assert.match(pageHeaderActionsClass, /h-8/);
  });
});

describe("pageHeaderMetaRowClass", () => {
  it("indents meta when a back column is shown", () => {
    assert.match(pageHeaderMetaRowClass(true), /ps-10/);
  });

  it("does not indent meta on list pages without a back control", () => {
    assert.doesNotMatch(pageHeaderMetaRowClass(false), /ps-/);
  });
});

describe("pageHeaderRootClass", () => {
  it("uses the sidebar-scale vertical gap between header rows", () => {
    assert.match(pageHeaderRootClass, new RegExp(layoutGapClass));
  });
});
