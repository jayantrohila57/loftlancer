"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DashboardSection from "@/components/section-dashboard";
import { appIcons } from "@/lib/icons";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

type TicketRow = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
};

const columns: DataTableColumnDef<TicketRow>[] = [
  {
    accessorKey: "ticketNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => `#${row.original.ticketNumber}`,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" />
    ),
    cell: ({ row }) => (
      <Link
        href={routes.supportTicket(row.original.id)}
        className="hover:underline"
      >
        {row.original.subject}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.status.replace("_", " ")}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
  },
];

export default function SupportTicketsPage() {
  const tickets = useQuery(trpc.support.listTickets.queryOptions({}));

  return (
    <DashboardSection
      title="My tickets"
      description="Create and track support requests."
      back={false}
      action={
        <Button render={<Link href={routes.supportNewTicket()} />}>
          New ticket
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={tickets.data?.items ?? []}
        isLoading={tickets.isLoading}
        isError={tickets.isError}
        empty={{
          empty: {
            icon: appIcons.support,
            title: "No tickets yet",
            description: "Support requests you create will appear here.",
            action: (
              <Button render={<Link href={routes.supportNewTicket()} />}>
                New ticket
              </Button>
            ),
          },
        }}
      />
    </DashboardSection>
  );
}
