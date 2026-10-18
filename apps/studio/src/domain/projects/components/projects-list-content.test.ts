import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const projectsDir = dirname(fileURLToPath(import.meta.url));

test("projects page header exposes New project for all views (#55)", () => {
  const pageSource = readFileSync(
    join(projectsDir, "projects-page-client.tsx"),
    "utf8",
  );
  assert.match(pageSource, /<Can action="project\.create">/);
  assert.match(
    pageSource,
    /<PageHeaderActionButton label="New project" onClick=\{openCreate\} \/>/,
  );

  const listSource = readFileSync(
    join(projectsDir, "projects-list-content.tsx"),
    "utf8",
  );
  assert.doesNotMatch(listSource, /primaryAction=\{newProjectButton\}/);
});

test("projects grid uses equal-width card layout (#55)", () => {
  const gridSource = readFileSync(
    join(projectsDir, "projects-grid-view.tsx"),
    "utf8",
  );
  assert.match(gridSource, /\[&>\*\]:w-full/);
  assert.match(gridSource, /self-stretch/);

  const cardSource = readFileSync(
    join(projectsDir, "project-card.tsx"),
    "utf8",
  );
  assert.match(cardSource, /w-full min-w-0/);
});
