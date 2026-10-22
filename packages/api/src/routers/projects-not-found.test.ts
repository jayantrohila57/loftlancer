import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const projectsRouterSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "projects.ts"),
  "utf8",
);

describe("projects router not-found errors", () => {
  it("uses TRPCError NOT_FOUND instead of plain Error", () => {
    assert.doesNotMatch(
      projectsRouterSource,
      /throw new Error\("Project not found"\)/,
    );

    const notFoundThrows =
      projectsRouterSource.match(
        /throw new TRPCError\(\{\s*code: "NOT_FOUND",\s*message: "Project not found",?\s*\}\)/g,
      ) ?? [];
    assert.equal(notFoundThrows.length, 9);
  });
});
