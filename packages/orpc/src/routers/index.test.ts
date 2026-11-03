import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSourcePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "index.ts",
);

describe("appRouter", () => {
  it("does not expose debug privateData that returns session user", () => {
    const routerSource = readFileSync(routerSourcePath, "utf8");
    assert.doesNotMatch(
      routerSource,
      /\bprivateData\s*:/,
      "privateData procedure must not be registered on the app router",
    );
  });
});
