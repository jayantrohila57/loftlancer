import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("filtered list no-results empty state has no clear-filters action (issue #62)", () => {
  const source = readFileSync(
    join(root, "components/patterns/filtered-list-no-results-empty.tsx"),
    "utf8",
  );
  assert.doesNotMatch(source, /actionLabel/);
  assert.doesNotMatch(source, /onAction/);
  assert.match(source, /toolbar above/);
});

test("project list content uses the shared no-results empty", () => {
  for (const rel of ["domain/projects/components/projects-list-content.tsx"]) {
    const source = readFileSync(join(root, rel), "utf8");
    assert.match(source, /FilteredListNoResultsEmpty/);
    assert.doesNotMatch(source, /actionLabel="Clear filters"/);
  }
});

test("organization directory renders responsive cards with favorite controls", () => {
  const list = readFileSync(
    join(root, "domain/organizations/components/organizations-list-content.tsx"),
    "utf8",
  );
  const card = readFileSync(
    join(root, "domain/organizations/components/organization-card.tsx"),
    "utf8",
  );
  assert.match(list, /OrganizationCard/);
  assert.match(list, /xl:grid-cols-4/);
  assert.match(card, /onToggleFavorite/);
  assert.doesNotMatch(list, /DataTableToolbar|OrganizationsListFiltersBar/);
});
