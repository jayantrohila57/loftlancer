/**
 * Destructive local development reset + sample seed.
 *
 *   RESET_CONFIRM=yes KEEP_USER_EMAIL=you@example.com \\
 *     DATABASE_URL=... pnpm db:reset-seed
 */

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { eq, sql } from "drizzle-orm";

import { purgeAppData } from "./reset-seed-purge";
import { seedSampleData } from "./reset-seed-seed";
import { schemaBaselinePath, schemaFingerprint } from "./schema-fingerprint";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function assertConfirmed() {
  if (process.env.RESET_CONFIRM !== "yes") {
    console.error(
      "Refusing to run: set RESET_CONFIRM=yes to acknowledge data loss.",
    );
    process.exit(1);
  }
}

async function resolveKeepUser(email: string) {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(sql`lower(${user.email})`, normalized))
    .limit(1);

  const row = rows[0];
  if (!row) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }
  return row;
}

async function main() {
  assertConfirmed();
  const keepEmail = requireEnv("KEEP_USER_EMAIL");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const keepUser = await resolveKeepUser(keepEmail);

  console.log(`Keeping user ${keepUser.email} (${keepUser.id})`);
  console.log("Purging application data…");

  await purgeAppData(keepUser.id, keepUser.email);

  console.log("Seeding sample data…");
  const summary = await seedSampleData(keepUser);

  const packageDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
  const fingerprint = await schemaFingerprint(
    join(packageDirectory, "src", "schema"),
  );
  await writeFile(schemaBaselinePath(packageDirectory), `${fingerprint}\n`);

  console.log("Reset-seed complete.");
  console.log(
    JSON.stringify(
      {
        keptUser: { id: keepUser.id, email: keepUser.email },
        ...summary,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
