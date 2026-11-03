import type { ActionName } from "@features/authorization/utils";

import { getMcpToolMetadata } from "@/lib/mcp-tool-metadata";

export function McpToolDoc({ action }: { action: string }) {
  const meta = getMcpToolMetadata(action as ActionName);
  if (!meta) {
    return (
      <p className="text-destructive text-sm">
        Unknown MCP action: <code>{action}</code>
      </p>
    );
  }

  const exampleInput =
    meta.inputSchema &&
    typeof meta.inputSchema === "object" &&
    "properties" in meta.inputSchema
      ? Object.fromEntries(
          Object.entries(
            (meta.inputSchema as { properties?: Record<string, unknown> })
              .properties ?? {},
          ).map(([key, value]) => {
            const typed = value as { type?: string; format?: string };
            if (typed.type === "string" && typed.format === "email") {
              return [key, "teammate@example.com"];
            }
            if (typed.type === "string") return [key, "…"];
            if (typed.type === "number") return [key, 10];
            if (typed.type === "boolean") return [key, true];
            return [key, null];
          }),
        )
      : {};

  return (
    <div className="not-prose space-y-6 text-sm">
      <dl className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground font-medium">MCP tool</dt>
          <dd className="font-mono text-xs">{meta.toolName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground font-medium">
            Canonical action
          </dt>
          <dd className="font-mono text-xs">{meta.action}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground font-medium">Description</dt>
          <dd>{meta.description}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground font-medium">OAuth scopes</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {meta.scopes.map((scope) => (
              <code
                key={scope}
                className="bg-muted rounded px-2 py-0.5 text-xs"
              >
                {scope}
              </code>
            ))}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground font-medium">Org roles</dt>
          <dd>
            {meta.orgRoles?.length
              ? meta.orgRoles.join(", ")
              : "— (user/platform scope)"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground font-medium">Project grant</dt>
          <dd>
            {meta.requiresProjectGrant ? "May require grant" : "Org role only"}
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="mb-2 text-base font-semibold">Input (JSON)</h3>
        <p className="text-muted-foreground mb-2">
          Validated with Zod in <code>@loftlancer/orpc/mcp</code>. Organization
          context uses <code>organizationId</code> or{" "}
          <code>organizationSlug</code> (MCP tokens do not carry an active-org
          cookie).
        </p>
        <pre className="bg-muted/30 overflow-x-auto rounded-lg border p-4 font-mono text-xs">
          {JSON.stringify(meta.inputSchema, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold">Example request</h3>
        <pre className="bg-muted/30 overflow-x-auto rounded-lg border p-4 font-mono text-xs">
          {JSON.stringify(
            { name: meta.toolName, arguments: exampleInput },
            null,
            2,
          )}
        </pre>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold">Output</h3>
        <p className="text-muted-foreground">
          The MCP server returns a single <code>text</code> content block whose
          body is pretty-printed JSON from the underlying studio tRPC caller (
          <code>runMcpTool</code> in <code>@loftlancer/orpc/mcp</code>). Errors
          surface as tool errors (for example <code>insufficient_scope</code>,{" "}
          <code>organization_required</code>, or validation messages).
        </p>
      </div>
    </div>
  );
}
