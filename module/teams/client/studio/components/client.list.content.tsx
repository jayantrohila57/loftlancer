"use client";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { PageStatusEmpty } from "@loftlancer/ui/patterns/page-state";
import Link from "next/link";
import type { TeamDto } from "../../../utils/types/utils.team.dto";
import { teamDisplayName } from "../../../utils/utils.team-display-name";
import { routes } from "../config/client.routes";
export function TeamsListContent({
  teams,
  slug,
  organizationName,
}: {
  teams: TeamDto[];
  slug: string;
  organizationName: string;
}) {
  if (!teams.length)
    return (
      <PageStatusEmpty
        title="No teams yet"
        description="Create a team to organize members and project access."
      />
    );
  return (
    <DataTable
      framed
      searchable
      enablePagination
      pageSize={20}
      searchPlaceholder="Search teams…"
      data={teams}
      columns={[
        {
          accessorKey: "name",
          header: "Team",
          cell: ({ row }) => (
            <div className="min-w-0">
              <Link
                href={routes.team(slug, row.original.id) as never}
                className="font-medium hover:underline"
              >
                {teamDisplayName(row.original.name, organizationName)}
              </Link>
              <span className="mt-1 block max-w-md truncate text-muted-foreground text-xs">
                {row.original.purpose ||
                  row.original.description ||
                  "No team description"}
              </span>
            </div>
          ),
        },
        {
          id: "projects",
          header: "Project access",
          cell: ({ row }) => (
            <Link
              href={
                routes.teamSection(slug, row.original.id, "projects") as never
              }
              className="text-primary text-sm hover:underline"
            >
              Review linked projects
            </Link>
          ),
        },
      ]}
    />
  );
}
