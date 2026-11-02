"use client";

import { Badge } from "@loftlancer/ui/badge";
import type { DataTableColumnDef } from "@loftlancer/ui/data-table/data-table";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { appIcons } from "@/lib/icons";
import { SupportTicketCreateAction } from "@/module/support/support.ticket.create-action";
import { CreateSupportTicketSheet } from "@/module/support/support.ticket.create-sheet";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import type { SupportTickets } from "./support.ticket.service";

type TicketRow = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
};

const TICKET_STATUSES = [
  "all",
  "open",
  "pending",
  "in_progress",
  "resolved",
  "closed",
] as const;
const TICKET_CATEGORIES = [
  "all",
  "bug",
  "billing",
  "account",
  "feature_request",
  "other",
] as const;
const TICKET_PRIORITIES = ["all", "low", "normal", "high", "urgent"] as const;

const columns: DataTableColumnDef<TicketRow>[] = [
  {
    accessorKey: "ticketNumber",
    header: "#",
    cell: ({ row }) => `#${row.original.ticketNumber}`,
  },
  {
    accessorKey: "subject",
    header: "Subject",
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
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.status.replace("_", " ")}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
];

export function SupportTicketsPage({
  createRoute = false,
  initialTickets,
}: {
  createRoute?: boolean;
  initialTickets: SupportTickets;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(createRoute);
  const [search, setSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [status, setStatus] = useState<(typeof TICKET_STATUSES)[number]>("all");
  const [category, setCategory] =
    useState<(typeof TICKET_CATEGORIES)[number]>("all");
  const [priority, setPriority] =
    useState<(typeof TICKET_PRIORITIES)[number]>("all");
  const [sort, setSort] = useState("updatedAt:desc");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    const timer = window.setTimeout(() => setQuerySearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => setCreateOpen(createRoute), [createRoute]);

  const closeCreate = (open: boolean) => {
    setCreateOpen(open);
    if (!open && createRoute) router.push(routes.supportTickets());
  };

  const [sortBy, sortDir] = sort.split(":") as [
    "updatedAt" | "createdAt" | "ticketNumber" | "priority",
    "asc" | "desc",
  ];
  const tickets = useQuery({
    ...trpc.support.listTickets.queryOptions({
      limit: pageSize,
      offset: page * pageSize,
      search: querySearch || undefined,
      status: status === "all" ? undefined : status,
      category: category === "all" ? undefined : category,
      priority: priority === "all" ? undefined : priority,
      sortBy,
      sortDir,
    }),
    initialData:
      page === 0 &&
      !querySearch &&
      status === "all" &&
      category === "all" &&
      priority === "all" &&
      sort === "updatedAt:desc"
        ? initialTickets
        : undefined,
  });
  const resetPage = (update: () => void) => {
    setPage(0);
    update();
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={tickets.data?.items ?? []}
        isLoading={tickets.isLoading}
        isFetching={tickets.isFetching}
        isError={tickets.isError}
        searchPlaceholder="Search tickets…"
        searchValue={search}
        onSearchChange={(value) => resetPage(() => setSearch(value))}
        filter={
          <>
            <SearchableCombobox
              value={status}
              onChange={(value) =>
                resetPage(() =>
                  setStatus(value as (typeof TICKET_STATUSES)[number]),
                )
              }
              ariaLabel="Filter tickets by status"
              className="w-40"
              options={TICKET_STATUSES.map((value) => ({
                value,
                label:
                  value === "all" ? "All statuses" : value.replaceAll("_", " "),
              }))}
            />
            <SearchableCombobox
              value={category}
              onChange={(value) =>
                resetPage(() =>
                  setCategory(value as (typeof TICKET_CATEGORIES)[number]),
                )
              }
              ariaLabel="Filter tickets by category"
              className="w-40"
              options={TICKET_CATEGORIES.map((value) => ({
                value,
                label:
                  value === "all"
                    ? "All categories"
                    : value.replaceAll("_", " "),
              }))}
            />
            <SearchableCombobox
              value={priority}
              onChange={(value) =>
                resetPage(() =>
                  setPriority(value as (typeof TICKET_PRIORITIES)[number]),
                )
              }
              ariaLabel="Filter tickets by priority"
              className="w-40"
              options={TICKET_PRIORITIES.map((value) => ({
                value,
                label: value === "all" ? "All priorities" : value,
              }))}
            />
          </>
        }
        toolbarTrailing={
          <SearchableCombobox
            value={sort}
            onChange={(value) => resetPage(() => setSort(value))}
            ariaLabel="Sort tickets"
            className="w-44"
            options={[
              { value: "updatedAt:desc", label: "Recently updated" },
              { value: "createdAt:desc", label: "Newest created" },
              { value: "createdAt:asc", label: "Oldest created" },
              { value: "ticketNumber:desc", label: "Ticket number" },
              { value: "priority:desc", label: "Priority" },
            ]}
          />
        }
        serverPagination={{
          pageIndex: page,
          pageCount: Math.max(
            1,
            Math.ceil((tickets.data?.total ?? 0) / pageSize),
          ),
          onPageChange: setPage,
        }}
        searchable
        framed
        compactLayout
        caption="Support tickets"
        emptyMessage="No tickets match these filters."
        empty={{
          empty: {
            icon: appIcons.support,
            title: "No tickets yet",
            description: "Support requests you create will appear here.",
            action: (
              <SupportTicketCreateAction>New ticket</SupportTicketCreateAction>
            ),
          },
        }}
      />
      <CreateSupportTicketSheet open={createOpen} onOpenChange={closeCreate} />
    </>
  );
}
