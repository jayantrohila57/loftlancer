"use client";

import { DataTableActionsColumnHeader } from "@features/data-table/core/client/data-table.actions-column";
import {
  DataTable,
  type DataTableColumnDef,
} from "@features/data-table/core/client/data-table.table";
import { useHydrated } from "@features/patterns/core/client/patterns.use-hydrated.hook";
import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { Spinner } from "@loftlancer/ui/spinner";
import { Monitor, MonitorSmartphone, Smartphone, Tablet } from "lucide-react";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import { formatDateTime } from "@/lib/format";
import {
  parseSessionDevice,
  type SessionDeviceKind,
  sessionDeviceLabel,
} from "@/lib/session-device";

export type AuthSessionRow = {
  id?: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  updatedAt?: Date | string;
  createdAt?: Date | string;
};

const DEVICE_ICONS: Record<SessionDeviceKind, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: MonitorSmartphone,
};

type SessionsTableProps = {
  sessions: AuthSessionRow[];
  currentToken?: string;
  pendingToken?: string | null;
  disabled?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorDescription?: string;
  onRevoke: (token: string) => void;
};

/** Loading state: the shared table skeleton at the same size. */
export function SessionsListSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <SessionsList
      sessions={[]}
      isLoading
      skeletonRows={rows}
      onRevoke={() => {}}
    />
  );
}

/** Account sessions on the shared @loftlancer/ui DataTable (#290). */
export function SessionsList({
  sessions,
  currentToken,
  pendingToken,
  disabled,
  isLoading,
  isError,
  errorDescription,
  onRevoke,
  skeletonRows = 2,
}: SessionsTableProps & { skeletonRows?: number }) {
  const ordered = [...sessions].sort((a, b) => {
    if (a.token === currentToken) return -1;
    if (b.token === currentToken) return 1;
    return (
      new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime() -
      new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime()
    );
  });
  // Local-time tooltip only after hydration (server has no viewer zone).
  const hydrated = useHydrated();
  const columns: DataTableColumnDef<AuthSessionRow>[] = [
    {
      id: "device",
      header: "Device",
      cell: ({ row }) => {
        const r = row.original;
        const Icon = DEVICE_ICONS[parseSessionDevice(r.userAgent).kind];
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span className="bg-muted ring-border/60 flex size-7 shrink-0 items-center justify-center rounded-md ring-1">
              <Icon className="text-muted-foreground size-4" aria-hidden />
            </span>
            <span className="truncate font-medium">
              {sessionDeviceLabel(r.userAgent)}
            </span>
            {r.token === currentToken ? (
              <Badge variant="secondary" className="shrink-0">
                Current
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "ip",
      header: "IP address",
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.ipAddress || "Unknown"}
        </span>
      ),
    },
    {
      id: "lastActive",
      header: "Last active",
      cell: ({ row }) => {
        const r = row.original;
        const last = r.updatedAt ?? r.createdAt;
        if (!last) return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className="text-muted-foreground"
            title={hydrated ? formatDateTime(String(last)) : undefined}
          >
            {r.token === currentToken ? (
              "Active now"
            ) : (
              <ClientRelativeTime value={String(last)} />
            )}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <DataTableActionsColumnHeader />,
      cell: ({ row }) => {
        const r = row.original;
        const pending = pendingToken === r.token;
        return (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-20 shrink-0"
              disabled={disabled || pending}
              onClick={() => onRevoke(r.token)}
            >
              {pending ? <Spinner className="size-3.5" /> : null}
              {r.token === currentToken ? "Sign out" : "Revoke"}
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <DataTable
      framed
      columns={columns}
      data={ordered}
      isLoading={isLoading}
      isError={isError}
      errorTitle="Could not load sessions"
      errorDescription={errorDescription}
      skeletonRowCount={skeletonRows}
      empty={{
        empty: {
          title: "No active sessions",
          description: "Sign in again to refresh this list.",
        },
      }}
    />
  );
}
