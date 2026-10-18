"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import {
  DataTable,
  type DataTableColumnDef,
} from "@loftlancer/ui/data-table/data-table";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import DashboardSection from "@/components/section-dashboard";
import { useProjectApps } from "@/domain/apps/hooks/use-project-apps";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { withBasePath } from "@/lib/base-path";
import { ListTodo, Plus } from "@/lib/icons";
import { initialsFromLabel } from "@/lib/initials";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";
import {
  priorityBadgeVariant,
  priorityLabel,
  statusBadgeVariant,
  statusLabel,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type TaskPriority,
  type TaskStatus,
} from "../hooks/task-meta";
import { CreateTaskSheet } from "./create-task-sheet";
import { FieldSelect } from "./field-select";
import { TaskDetailSheet } from "./task-detail-sheet";

const PAGE_SIZE = 50;

export function TasksPageSkeleton() {
  return (
    <DashboardSection title="Tasks" description="Track work for this project.">
      <div className="flex flex-col gap-3" role="status" aria-busy="true">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </DashboardSection>
  );
}

export function TasksPage({ slug }: { slug: string }) {
  const pathname = usePathname();
  const org = useOrgSlug();
  const { projectId, project, apps } = useProjectApps(slug);
  const taskSettings = apps.find((a) => a.id === "tasks")?.settings;
  const createDefaults = useMemo(
    () =>
      taskSettings
        ? {
            status: taskSettings.defaultStatus as TaskStatus,
            priority: taskSettings.defaultPriority as TaskPriority,
          }
        : undefined,
    [taskSettings],
  );
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const canCreate = useCan("tasks.task.create", {
    projectId: projectId ?? undefined,
  });

  // The open task is in the path (#299): /[org]/[project]/tasks/[n]. Native
  // history keeps the list mounted (filters, page) while the panel opens;
  // Next syncs usePathname with it. The raw API needs the basePath.
  const taskMatch = /\/tasks\/(\d+)$/.exec(pathname ?? "");
  const openNumber = taskMatch ? Number(taskMatch[1]) : null;
  const setOpenNumber = (n: number | null) => {
    const href = n ? routes.task(org, slug, n) : routes.tasks(org, slug);
    window.history.pushState(null, "", withBasePath(href));
  };

  const people = useQuery({
    ...trpc.tasks.people.queryOptions({ projectId: projectId ?? "" }),
    enabled: Boolean(projectId),
  });
  const list = useQuery({
    ...trpc.tasks.list.queryOptions({
      projectId: projectId ?? "",
      status: status === "all" ? undefined : (status as TaskStatus),
      priority: priority === "all" ? undefined : (priority as TaskPriority),
      assigneeId: assignee === "all" ? undefined : assignee,
      search: deferredSearch || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    enabled: Boolean(projectId),
    placeholderData: (prev) => prev,
  });

  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;
  const filtered =
    status !== "all" ||
    priority !== "all" ||
    assignee !== "all" ||
    Boolean(deferredSearch);
  const peopleOptions = (people.data ?? []).map((p) => ({
    value: p.id,
    label: p.name || p.email,
    hint: p.name ? p.email : undefined,
  }));
  const resetPage =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setPage(0);
    };

  type TaskRow = (typeof rows)[number];
  const taskColumns: DataTableColumnDef<TaskRow>[] = [
    {
      id: "number",
      header: "ID",
      meta: { className: "w-16" },
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          #{row.original.number}
        </span>
      ),
    },
    {
      id: "title",
      header: "Title",
      meta: { className: "max-w-0" },
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex min-w-0 items-center gap-1.5">
            <Link
              href={routes.task(org, slug, t.number)}
              className="truncate hover:underline"
              onClick={(e) => {
                // Plain click opens the sheet in place; modifier clicks open a new tab.
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                setOpenNumber(t.number);
              }}
            >
              {t.title}
            </Link>
            {t.labels.slice(0, 2).map((l) => (
              <Badge key={l} variant="outline" size="sm" className="shrink-0">
                {l}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      meta: { className: "w-32" },
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.status)} size="sm">
          {statusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      meta: { className: "w-28" },
      cell: ({ row }) =>
        row.original.priority === "none" ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <Badge
            variant={priorityBadgeVariant(row.original.priority)}
            size="sm"
          >
            {priorityLabel(row.original.priority)}
          </Badge>
        ),
    },
    {
      id: "assignee",
      header: "Assignee",
      meta: { className: "w-44" },
      cell: ({ row }) => {
        const t = row.original;
        return t.assigneeId ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar className="size-5">
              {t.assigneeImage ? (
                <AvatarImage src={t.assigneeImage} alt="" />
              ) : null}
              <AvatarFallback className="text-[9px]">
                {initialsFromLabel(t.assigneeName ?? "?", "?")}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs">{t.assigneeName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">Unassigned</span>
        );
      },
    },
    {
      id: "due",
      header: "Due",
      meta: { className: "w-28" },
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          <LocalDateTime value={row.original.dueDate} />
        </span>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      meta: { className: "w-28" },
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          <ClientRelativeTime value={row.original.updatedAt} />
        </span>
      ),
    },
  ];

  return (
    <DashboardSection
      title="Tasks"
      description={
        project
          ? `Track work for ${project.name}.`
          : "Track work for this project."
      }
      back={routes.project(org, slug)}
      action={
        canCreate.allowed ? (
          <Button size="sm" className="h-8" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New task
          </Button>
        ) : null
      }
    >
      <DataTable
        framed
        columns={taskColumns}
        data={rows}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        isError={list.isError}
        errorTitle="Tasks unavailable"
        errorDescription="We couldn't load tasks."
        filterActive={filtered}
        pageSize={PAGE_SIZE}
        skeletonRowCount={8}
        searchPlaceholder="Search tasks…"
        searchValue={search}
        onSearchChange={resetPage(setSearch)}
        filter={
          <div className="flex flex-wrap items-center gap-1.5">
            <FieldSelect
              ariaLabel="Filter by status"
              value={status}
              onChange={resetPage(setStatus)}
              options={[
                { value: "all", label: "All statuses" },
                ...TASK_STATUS_OPTIONS,
              ]}
            />
            <FieldSelect
              ariaLabel="Filter by priority"
              value={priority}
              onChange={resetPage(setPriority)}
              options={[
                { value: "all", label: "All priorities" },
                ...TASK_PRIORITY_OPTIONS,
              ]}
            />
            <FieldSelect
              ariaLabel="Filter by assignee"
              className="w-44"
              value={assignee}
              onChange={resetPage(setAssignee)}
              options={[
                { value: "all", label: "Anyone" },
                { value: "none", label: "Unassigned" },
                ...peopleOptions,
              ]}
            />
          </div>
        }
        toolbarTrailing={
          <span className="text-muted-foreground text-xs tabular-nums">
            {list.data
              ? `${total} ${total === 1 ? "task" : "tasks"}`
              : "\u00a0"}
          </span>
        }
        serverPagination={{
          pageIndex: page,
          pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
          onPageChange: setPage,
        }}
        onRowClick={(t) => setOpenNumber(t.number)}
        rowLabel={(t) => `Open task #${t.number}: ${t.title}`}
        empty={{
          empty: {
            icon: ListTodo,
            title: "No tasks yet",
            description: "Create the first task for this project.",
            action: canCreate.allowed ? (
              <Button
                size="sm"
                className="h-8"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" aria-hidden />
                New task
              </Button>
            ) : undefined,
          },
          noResults: {
            title: "No matching tasks",
            description: "Try different filters.",
          },
        }}
      />

      {projectId ? (
        <>
          <CreateTaskSheet
            open={createOpen}
            onOpenChange={setCreateOpen}
            projectId={projectId}
            people={peopleOptions}
            onCreated={(n) => setOpenNumber(n)}
            defaults={createDefaults}
          />
          <TaskDetailSheet
            projectId={projectId}
            number={openNumber}
            people={people.data ?? []}
            onClose={() => setOpenNumber(null)}
          />
        </>
      ) : null}
    </DashboardSection>
  );
}
