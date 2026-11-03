import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mcp } from "@better-auth/mcp";
import { getAuthTables } from "better-auth/db";
import { jwt } from "better-auth/plugins";

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatePath = join(
  __dirname,
  "../node_modules/@better-auth/drizzle-adapter/dist/generate-drizzle-schema-iWvrXnu0.mjs",
);

const { generateDrizzleSchema } = await import(
  pathToFileURL(generatePath).href
);

const options = {
  advanced: { database: { generateId: false } },
  plugins: [
    jwt(),
    mcp({
      loginPage: "/",
      consentPage: "/consent",
      resource: "https://loftlancer.com/api/mcp",
    }),
  ],
};

const allTables = getAuthTables(options);
const tables = {
  user: allTables.user,
  session: allTables.session,
  ...Object.fromEntries(
    Object.entries(allTables).filter(([key]) => key.startsWith("oauth")),
  ),
};

const tempTarget = join(__dirname, "../src/schema/oauth.generated.tmp.ts");
const result = await generateDrizzleSchema({
  options,
  provider: "pg",
  tables,
  file: tempTarget,
});

const lines = result.code.split("\n");
const oauthStart = lines.findIndex((line) =>
  line.startsWith("export const oauth"),
);
const header = `import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { session, user } from "./better-auth";

`;

const body = lines
  .slice(oauthStart)
  .filter((line) => !line.includes("authRelations"))
  .filter((line) => !line.includes("defineRelationsPart"));
// Drop generated relation blocks (not needed for drizzle adapter).
const relationStart = body.findIndex((line) => /^\s+user:\s*\{/.test(line));
const trimmed = relationStart === -1 ? body : body.slice(0, relationStart);
writeFileSync(
  join(__dirname, "../src/schema/oauth.ts"),
  `${header}${trimmed.join("\n").trim()}\n`,
);
console.log(`Wrote oauth schema (${trimmed.length} lines)`);
