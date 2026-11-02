import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = process.env.API_ENTRYPOINT_INVENTORY_OUT
  ? path.resolve(process.env.API_ENTRYPOINT_INVENTORY_OUT)
  : null;

async function files(directory, predicate) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return files(target, predicate);
      return predicate(target) ? [target] : [];
    }),
  );
  return nested.flat();
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function line(text, position) {
  return text.slice(0, position).split("\n").length;
}

async function trpcProcedures() {
  const routerDirectory = path.join(root, "packages/api/src/routers");
  const routerFiles = (
    await files(routerDirectory, (file) => file.endsWith(".ts"))
  ).filter((file) => !file.endsWith(".test.ts"));
  const operations = [];
  for (const file of routerFiles) {
    const text = await readFile(file, "utf8");
    const matcher =
      /^\s+([A-Za-z0-9_]+):\s*(?:(?:public|protected|org|orgAware|console)Procedure)\b[\s\S]{0,1200}?\.(query|mutation|subscription)\(/gm;
    for (const match of text.matchAll(matcher)) {
      operations.push({
        file: relative(file),
        line: line(text, match.index ?? 0),
        name: match[1],
        kind: match[2],
      });
    }
  }
  return operations.sort((a, b) =>
    a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file),
  );
}

function routePath(file) {
  const segments = relative(file).split("/");
  const app = segments[1];
  const appDirectory = segments.indexOf("app");
  const route = segments.slice(appDirectory + 1, -1).join("/");
  return { app, path: `/${route}`.replaceAll("//", "/") };
}

function routeControls(content, route) {
  if (content.includes("createContextWithAuth")) {
    return "session context; procedure authorization";
  }
  if (
    content.includes("getServerSession") ||
    content.includes(".api.getSession")
  ) {
    return "server session check";
  }
  if (content.includes("resolveE2eRouteAccess")) {
    return "E2E runtime gate";
  }
  if (content.includes("CRON_SECRET")) {
    return "cron bearer secret";
  }
  if (content.includes("isSentryTestRequest")) {
    return "Sentry test token";
  }
  if (content.includes(".handler(") || route.path.startsWith("/api/auth/")) {
    return "Better Auth handler or flow";
  }
  if (
    route.path.includes("/health") ||
    route.path.includes("/status") ||
    route.path.startsWith("/.well-known/")
  ) {
    return "public health or metadata";
  }
  return "manual control review required";
}

async function httpRoutes() {
  const appFiles = await files(path.join(root, "apps"), (file) =>
    file.endsWith("/route.ts"),
  );
  const entries = [];
  for (const file of appFiles) {
    const content = await readFile(file, "utf8");
    const methods = [
      ...content.matchAll(
        /handler as (DELETE|GET|PATCH|POST|PUT)|export async function (DELETE|GET|PATCH|POST|PUT)/g,
      ),
    ].map((match) => match[1] ?? match[2]);
    const route = routePath(file);
    entries.push({
      ...route,
      methods: [...new Set(methods)].sort().join(", ") || "route handler",
      controls: routeControls(content, route),
      file: relative(file),
    });
  }
  return entries.sort((a, b) =>
    a.app === b.app ? a.path.localeCompare(b.path) : a.app.localeCompare(b.app),
  );
}

async function sourceMatches(pattern) {
  const sourceFiles = await files(
    root,
    (file) =>
      /\.(?:ts|tsx)$/.test(file) &&
      !file.includes("/node_modules/") &&
      !file.includes("/.next/"),
  );
  const matches = [];
  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(pattern))
      matches.push({
        file: relative(file),
        line: line(content, match.index ?? 0),
        value: match[0],
      });
  }
  return matches;
}

async function mcpActions() {
  const file = path.join(root, "packages/api/src/mcp/handlers.ts");
  const content = await readFile(file, "utf8");
  return [...content.matchAll(/^ {2}"([^"]+)": \{/gm)].map((match) => match[1]);
}

const [procedures, routes, serverActions, betterAuthCalls, actions] =
  await Promise.all([
    trpcProcedures(),
    httpRoutes(),
    sourceMatches(/^[ \t]*["']use server["'];?/gm),
    sourceMatches(/\b(?:auth|siblingAuth)\.api\.[A-Za-z0-9_]+/g),
    mcpActions(),
  ]);

const rows = (items) => items.join("\n");
const markdown = [
  "# Backend entry-point inventory",
  "",
  "Generated by `pnpm audit:api-entrypoints`. It is a source inventory, not a runtime authorization proof. Re-run it whenever a router, route handler, server action, Better Auth mutation, or MCP action changes.",
  "",
  "## Current architecture",
  "",
  `- **tRPC:** ${procedures.length} procedures in ${new Set(procedures.map((item) => item.file)).size} router modules. Studio and Auth expose separate router roots.`,
  "- **Parallel oRPC:** `/api/orpc/*` is mounted in Studio and Auth through `@orpc/trpc` conversion. It retains tRPC authorization while module-owned operations are extracted incrementally.",
  `- **HTTP:** ${routes.length} Next route handlers were found across product apps.`,
  `- **Server actions:** ${serverActions.length}. ${serverActions.length === 0 ? 'No app-level "use server" entry points were found.' : "Review each below."}`,
  `- **Direct Better Auth API calls:** ${betterAuthCalls.length}. These are backend entry points outside tRPC and must keep their own authorization checks.`,
  `- **MCP:** ${actions.length} exposed action handlers, mapped from the central action registry.`,
  "",
  "## Required control points",
  "",
  "| Entry point | Authentication and authorization owner | Audit / observability owner |",
  "| --- | --- | --- |",
  "| tRPC / parallel oRPC | `protectedProcedure`, `orgProcedure`, `actionGuard`, `requireAction` | procedure-level audit middleware and action services |",
  "| Next HTTP route | each route handler | route-local logger / audit writer |",
  "| Better Auth | Better Auth configuration and route-local checks | auth events and route-local logger |",
  "| MCP | `packages/mcp` scope gate, `mcpActionHandlers`, action registry | MCP handler and action audit writer |",
  "",
  "## Module migration rule",
  "",
  "New or migrated business operations live under `packages/api/src/modules/<module>/api/api.<operation>.ts`. Transport adapters may call those operations, but cannot contain business authorization or data mutation logic. The first extracted reference is `modules/teams/api/api.get-teams.ts`.",
  "",
  "## tRPC procedure inventory",
  "",
  "| Router file | Line | Procedure | Kind |",
  "| --- | ---: | --- | --- |",
  rows(
    procedures.map(
      (item) =>
        `| \`${item.file}\` | ${item.line} | \`${item.name}\` | ${item.kind} |`,
    ),
  ),
  "",
  "## Next HTTP route inventory",
  "",
  "| App | Route | Methods | Controls observed | Source |",
  "| --- | --- | --- | --- | --- |",
  rows(
    routes.map(
      (item) =>
        `| ${item.app} | \`${item.path}\` | ${item.methods} | ${item.controls} | \`${item.file}\` |`,
    ),
  ),
  "",
  "## Server actions",
  "",
  serverActions.length
    ? rows([
        "| Source | Line | Directive |",
        "| --- | ---: | --- |",
        ...serverActions.map(
          (item) =>
            `| \`${item.file}\` | ${item.line} | \`${item.value.trim()}\` |`,
        ),
      ])
    : "None found in first-party TypeScript sources.",
  "",
  "## Direct Better Auth API calls",
  "",
  betterAuthCalls.length
    ? rows([
        "| Source | Line | Call |",
        "| --- | ---: | --- |",
        ...betterAuthCalls.map(
          (item) => `| \`${item.file}\` | ${item.line} | \`${item.value}\` |`,
        ),
      ])
    : "None found.",
  "",
  "## MCP exposed actions",
  "",
  rows(actions.map((action) => `- \`${action}\``)),
  "",
  "## Audit findings and next actions",
  "",
  "1. tRPC is centralized in `packages/api/src/routers`; route domains are not yet module-owned. Extract one operation at a time behind the stable procedure contract, then migrate the transport client.",
  "2. The oRPC adapter shares procedures deliberately during transition. Its error format differs from the current tRPC formatter, so error-shape parity must be checked before moving a client feature.",
  "3. Each HTTP route must be reviewed separately: source discovery cannot prove authentication, action authorization, audit records, or quota enforcement.",
  "4. Every MCP action should remain a registry action with a declared scope. Add the action and its handler together, and retain `mcp-exposed-actions` coverage.",
  "5. Re-run this inventory and compare the generated diff in every backend-entry-point PR.",
].join("\n");

if (output) {
  await writeFile(output, `${markdown}\n`);
  console.log(
    `Wrote ${relative(output)}: ${procedures.length} procedures, ${routes.length} HTTP routes, ${actions.length} MCP actions.`,
  );
} else {
  console.log(
    `Inventory: ${procedures.length} tRPC procedures, ${routes.length} HTTP routes, ${actions.length} MCP actions. Set API_ENTRYPOINT_INVENTORY_OUT to write markdown.`,
  );
}
