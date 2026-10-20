import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { schemaFingerprint } from "./schema-fingerprint";

describe("schemaFingerprint", () => {
  it("is stable for the same files and changes when schema files change", async () => {
    const root = await mkdtemp(join(tmpdir(), "loftlancer-schema-"));
    const schema = join(root, "schema");
    const nested = join(schema, "auth");
    await mkdir(nested, { recursive: true });

    try {
      await writeFile(
        join(schema, "index.ts"),
        'export * from "./auth/user";\n',
      );
      await writeFile(join(nested, "user.ts"), "export const user = {};\n");

      const first = await schemaFingerprint(schema);
      assert.equal(await schemaFingerprint(schema), first);

      await writeFile(
        join(nested, "user.ts"),
        "export const user = { id: true };\n",
      );
      assert.notEqual(await schemaFingerprint(schema), first);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
