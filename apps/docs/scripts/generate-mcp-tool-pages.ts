import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  actionRegistry,
  mcpToolNameFromAction,
  requiredOAuthScopesForAction,
} from "@features/authorization/utils";
import { listMcpExposedActions, mcpActionHandlers } from "@loftlancer/orpc/mcp";
import { zodToJsonSchema } from "zod-to-json-schema";

const root = join(import.meta.dirname, "..");
const toolsDir = join(root, "content/docs/mcp/tools");
const catalogPath = join(root, "src/generated/mcp-tools-catalog.json");

mkdirSync(toolsDir, { recursive: true });
mkdirSync(join(root, "src/generated"), { recursive: true });

const actions = listMcpExposedActions();

const catalog = actions.map((action) => {
  const def = actionRegistry[action];
  const handler = mcpActionHandlers[action];
  const inputSchema = handler
    ? (zodToJsonSchema(
        handler.schema as Parameters<typeof zodToJsonSchema>[0],
        {
          name: mcpToolNameFromAction(action),
          $refStrategy: "none",
        },
      ) as Record<string, unknown>)
    : {};

  return {
    action,
    toolName: mcpToolNameFromAction(action),
    description: def?.description ?? `Execute ${action}`,
    scopes: [...requiredOAuthScopesForAction(action)],
    inputSchema,
    orgRoles: def?.orgRoles ?? null,
    requiresProjectGrant: Boolean(def?.requiresProjectGrant),
  };
});

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

const pages: string[] = ["index"];

for (const action of actions) {
  const tool = mcpToolNameFromAction(action);
  pages.push(tool);
  const body = `---
title: ${tool}
description: MCP tool for the ${action} action.
---

<McpToolDoc action="${action}" />
`;
  writeFileSync(join(toolsDir, `${tool}.mdx`), body, "utf8");
}

const indexBody = `---
title: Tool index
description: Every MCP tool registered by @loftlancer/mcp from implemented handlers.
---

Each page documents one tool exposed by \`registerMcpTools\` in \`@loftlancer/orpc/mcp\`. Tools without a handler there are not listed.

<McpToolsTable />
`;

writeFileSync(join(toolsDir, "index.mdx"), indexBody, "utf8");

writeFileSync(
  join(toolsDir, "meta.json"),
  JSON.stringify({ title: "Tools", pages }, null, 2),
  "utf8",
);

console.log(
  `Generated ${actions.length} MCP tool pages and catalog at ${catalogPath}`,
);
