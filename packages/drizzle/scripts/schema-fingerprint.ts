import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

async function listTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return listTypeScriptFiles(path);
      return entry.isFile() && entry.name.endsWith(".ts") ? [path] : [];
    }),
  );
  return nested.flat().sort();
}

export async function schemaFingerprint(schemaDirectory: string) {
  const files = await listTypeScriptFiles(schemaDirectory);
  const hash = createHash("sha256");

  for (const file of files) {
    const path = relative(schemaDirectory, file).split(sep).join("/");
    hash
      .update(path)
      .update("\0")
      .update(await readFile(file))
      .update("\0");
  }

  return hash.digest("hex");
}

export function schemaBaselinePath(packageDirectory: string) {
  return join(packageDirectory, ".reset-seed-schema-hash");
}
