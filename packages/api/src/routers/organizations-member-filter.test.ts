import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const listServiceSource = readFileSync(
  new URL(
    "../../../../module/organizations/server/service/server.organization-list.service.ts",
    import.meta.url,
  ),
  "utf8",
);
const getBySlugServiceSource = readFileSync(
  new URL(
    "../../../../module/organizations/server/service/server.organization-get-by-slug.service.ts",
    import.meta.url,
  ),
  "utf8",
);

describe("organizations router member filters", () => {
  it("filters organization reads with activeMemberWhere", () => {
    assert.match(listServiceSource, /activeMemberWhere/);
    assert.match(getBySlugServiceSource, /activeMemberWhere/);
  });
});
