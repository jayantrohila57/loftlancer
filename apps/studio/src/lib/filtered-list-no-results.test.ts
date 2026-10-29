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
  for (const rel of ["module/projects/projects.projects.list.content.tsx"]) {
    const source = readFileSync(join(root, rel), "utf8");
    assert.match(source, /FilteredListNoResultsEmpty/);
    assert.doesNotMatch(source, /actionLabel="Clear filters"/);
  }
});

test("organization directory keeps cards and uses shared search and sort controls", () => {
  const list = readFileSync(
    join(
      root,
      "module/organizations/organizations.organizations.list.content.tsx",
    ),
    "utf8",
  );
  const card = readFileSync(
    join(root, "module/organizations/organizations.organization.card.tsx"),
    "utf8",
  );
  assert.match(list, /OrganizationCard/);
  assert.match(list, /xl:grid-cols-4/);
  assert.match(list, /DataTableToolbar/);
  assert.match(list, /Search organizations/);
  assert.match(list, /Sort organizations/);
  assert.match(card, /onToggleFavorite/);
});
