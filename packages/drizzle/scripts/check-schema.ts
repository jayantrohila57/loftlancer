import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { schemaBaselinePath, schemaFingerprint } from "./schema-fingerprint";

const packageDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = schemaBaselinePath(packageDirectory);
const current = await schemaFingerprint(
  join(packageDirectory, "src", "schema"),
);

let recorded: string;
try {
  recorded = (await readFile(baselinePath, "utf8")).trim();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  await writeFile(baselinePath, `${current}\n`);
  console.log(
    "Recorded the initial local schema fingerprint; no data was changed.",
  );
  console.log(
    "Run this check again after applying future schema changes locally.",
  );
  process.exit(0);
}

if (recorded === current) {
  console.log(
    "Database schema files match the last recorded local fingerprint.",
  );
  process.exit(0);
}

console.log(
  "Database schema files changed since the last recorded local fingerprint.",
);
console.log(
  "After applying schema changes, reset and seed the disposable database:",
);
console.log(
  "RESET_CONFIRM=yes KEEP_USER_EMAIL=owner@example.com DATABASE_URL=postgresql://localhost:5432/loftlancer pnpm db:reset-seed",
);
