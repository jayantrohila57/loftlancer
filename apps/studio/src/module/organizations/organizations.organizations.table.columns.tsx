"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Button } from "@loftlancer/ui/button";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import Link from "next/link";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { AppIcon } from "@/components/patterns/app-icon";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { initialsFromLabel } from "@/lib/initials";
import { isPersonalOrganization } from "@/lib/org-personal";

import { routes } from "@/utils/navigation";

const columnHelper = legacyCreateColumnHelper<OrgListItem>();

export function createOrganizationsTableColumns(
  activeOrganizationId: string | null,
) {
  return [
    columnHelper.accessor("name", {
      header: "Organization",
      cell: ({ row }) => {
        const org = row.original;
        const href = routes.org(org.slug);
        return (
          <TableLeadingCell
            leading={
              <Avatar className="size-7">
                <AvatarImage src={org.logo ?? undefined} alt="" />
                <AvatarFallback className="bg-muted text-[10px]">
                  {initialsFromLabel(org.name, "OR")}
                </AvatarFallback>
              </Avatar>
            }
          >
            <Link
              href={href}
              className="block truncate font-medium hover:underline"
            >
              {org.name}
            </Link>
            <span className="block truncate font-mono text-muted-foreground text-xs">
              {org.slug}
            </span>
          </TableLeadingCell>
        );
      },
    }),
    columnHelper.display({
      id: "type",
      header: "Type",
      cell: ({ row }) =>
        isPersonalOrganization(row.original) ? "Personal" : "Team",
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.archivedAt
          ? "Archived"
          : row.original.id === activeOrganizationId
            ? "Active"
            : "—",
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const org = row.original;
        const href = routes.org(org.slug);
        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1"
            render={<Link href={href} />}
          >
            Open
            <AppIcon name="chevronRight" className="size-3.5" />
          </Button>
        );
      },
    }),
  ];
}
