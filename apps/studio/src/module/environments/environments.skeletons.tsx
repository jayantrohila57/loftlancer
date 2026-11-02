"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { ReactNode } from "react";
import { PageStack } from "@/components/layout/app-layout";
import { AppIcon } from "@/components/patterns/app-icon";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2-enabled";
import {
  VARIABLES_SEARCH_PLACEHOLDER,
  variableColumnClassNames,
} from "@/module/environments/environments.variables.table.columns";

type VariableSkeletonRow = { id: string };

const variableColumnHelper = legacyCreateColumnHelper<VariableSkeletonRow>();
const variableSkeletonColumns = [
  variableColumnHelper.display({ id: "key", header: "Key", cell: () => null }),
  variableColumnHelper.display({
    id: "value",
    header: "Value",
    cell: () => null,
  }),
  variableColumnHelper.display({
    id: "actions",
    header: "Actions",
    cell: () => null,
  }),
];

function SectionCardSkeleton({
  titleWidth,
  descriptionWidth,
  children,
}: {
  titleWidth: string;
  descriptionWidth: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className={`h-6 ${titleWidth}`} />
        </CardTitle>
        <CardDescription>
          <Skeleton className={`h-4 ${descriptionWidth}`} />
        </CardDescription>
      </CardHeader>
      <CardPanel>{children}</CardPanel>
    </Card>
  );
}

/** Card skeleton used by the project settings route. */
export function ProjectDetailSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <SectionCardSkeleton titleWidth="w-36" descriptionWidth="w-56">
        <Skeleton className="h-8 w-fit max-w-full rounded-lg sm:w-64" />
        <VariablesSkeleton />
      </SectionCardSkeleton>
    </div>
  );
}

export function VariablesSkeleton() {
  return (
    <DataTable
      columns={variableSkeletonColumns}
      data={[]}
      isLoading
      skeletonRowCount={4}
      framed
    />
  );
}

/** Environment tab labels in the skeleton rail (e.g. development, staging). */

const loadedVariableColumns = (variablesV2: boolean) => [
  variableColumnHelper.display({
    id: "key",
    meta: { className: variableColumnClassNames.key },
    header: () => (
      <span className="font-medium text-muted-foreground text-xs">Key</span>
    ),
    cell: () => null,
  }),
  variableColumnHelper.display({
    id: "value",
    meta: { className: variableColumnClassNames.value },
    header: "Value",
    cell: () => null,
  }),
  ...(variablesV2
    ? [
        variableColumnHelper.display({
          id: "updatedBy",
          meta: { className: variableColumnClassNames.updatedBy },
          header: "Updated",
          cell: () => null,
        }),
      ]
    : []),
  variableColumnHelper.display({
    id: "actions",
    meta: { className: variableColumnClassNames.actions },
    header: () => <DataTableActionsColumnHeader />,
    cell: () => null,
  }),
];

/**
 * Variables table while the environment loads: the loaded table's toolbar
 * (search, Copy/Import .env, Add variable), frame and columns, with skeleton
 * rows only in the body (#326).
 */
export function VariablesTableSkeleton() {
  const variablesV2 = isVariablesV2EnabledOnClient();
  return (
    <DataTable
      columns={loadedVariableColumns(variablesV2)}
      data={[]}
      isLoading
      searchable
      searchPlaceholder={VARIABLES_SEARCH_PLACEHOLDER}
      framed
      compactLayout
      toolbarTrailing={
        <>
          <Button type="button" variant="outline" className="h-8" disabled>
            <AppIcon name="copyEnv" />
            Copy as .env
          </Button>
          <Button type="button" variant="outline" className="h-8" disabled>
            <AppIcon name="importFile" />
            Import .env
          </Button>
        </>
      }
      primaryAction={
        <Button
          type="button"
          size="sm"
          className="max-sm:size-8 max-sm:gap-0 max-sm:px-0 sm:gap-1.5"
          disabled
          aria-label="Add variable"
        >
          <AppIcon name="plus" className="text-current" />
          <span className="sr-only sm:not-sr-only">Add variable</span>
        </Button>
      }
    />
  );
}

/**
 * Mirrors the environment accordion list and selected variable table.
 */
export function ProjectEnvironmentsSkeleton() {
  return (
    <PageStack className="w-full min-w-0 gap-4">
      <section
        className="flex min-w-0 flex-col gap-2"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading environments…</span>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-md border bg-card">
            <div className="flex min-h-12 items-center justify-between px-4 py-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-4 rounded" />
            </div>
            <div className="border-t px-4 py-4">
              <div className="mb-3 flex justify-end">
                <Skeleton className="size-8 rounded-md" />
              </div>
              <VariablesTableSkeleton />
            </div>
          </div>
          <div className="rounded-md border bg-card">
            <div className="flex min-h-12 items-center justify-between px-4 py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4 rounded" />
            </div>
          </div>
        </div>
      </section>
    </PageStack>
  );
}
