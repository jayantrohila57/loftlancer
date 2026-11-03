import Link from "next/link";

import { listMcpToolMetadata } from "@/lib/mcp-tool-metadata";

export function McpToolsTable() {
  const rows = listMcpToolMetadata();

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/40 border-b">
          <tr>
            <th className="px-4 py-2 font-medium">MCP tool</th>
            <th className="px-4 py-2 font-medium">Canonical action</th>
            <th className="px-4 py-2 font-medium">OAuth scopes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b last:border-0" key={row.action}>
              <td className="px-4 py-2 font-mono text-xs">
                <Link
                  href={`/docs/mcp/tools/${row.toolName}`}
                  className="text-primary hover:underline"
                >
                  {row.toolName}
                </Link>
              </td>
              <td className="px-4 py-2 font-mono text-xs">{row.action}</td>
              <td className="text-muted-foreground px-4 py-2 text-xs">
                {row.scopes.filter((s) => s !== "mcp:tools").join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-muted-foreground border-t px-4 py-3 text-xs">
        Includes <code className="text-foreground">permissions_snapshot</code>{" "}
        (registered in <code>@loftlancer/orpc/mcp</code>, not tied to a product
        handler). User-scoped account actions and platform admin APIs are
        excluded from MCP.
      </p>
    </div>
  );
}
