import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const sidebarSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "sidebar.ts"),
  "utf8",
);

function accessibleProjectsBlock(): string {
  const start = sidebarSource.indexOf("async function accessibleProjects");
  assert.notEqual(start, -1);
  const end = sidebarSource.indexOf(
    "async function resolveNavigatorOrganizationId",
  );
  assert.notEqual(end, -1);
  return sidebarSource.slice(start, end);
}

describe("sidebar accessibleProjects scope (#26)", () => {
  it("uses projectReadWhere instead of owner-only projectListFilter", () => {
    const block = accessibleProjectsBlock();
    assert.match(block, /projectReadWhere/);
    assert.doesNotMatch(block, /projectListFilter/);
    assert.doesNotMatch(block, /listAccessibleProjectIds/);
  });
});
