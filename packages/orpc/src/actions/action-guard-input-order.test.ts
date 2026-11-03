import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routersDir = join(dirname(fileURLToPath(import.meta.url)), "../routers");

function listRouterSources(dir: string): string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      paths.push(...listRouterSources(full));
      continue;
    }
    if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      paths.push(full);
    }
  }
  return paths;
}

/** Fails when actionGuard middleware is chained before `.input()` on the same procedure. */
const guardBeforeInputPattern =
  /\.use\(\s*[\s\S]*?actionGuard[\s\S]*?\)\s*\n\s*\.input\(/g;

describe("actionGuard input order", () => {
  it("declares .input() before .use(actionGuard) in API routers", () => {
    const violations: string[] = [];
    for (const file of listRouterSources(routersDir)) {
      const source = readFileSync(file, "utf8");
      const matches = source.match(guardBeforeInputPattern);
      if (matches?.length) {
        violations.push(`${file} (${matches.length} procedure(s))`);
      }
    }
    assert.deepEqual(
      violations,
      [],
      `Move .input() before .use(actionGuard):\n${violations.join("\n")}`,
    );
  });
});
