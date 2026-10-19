"use client";

import { Button } from "@loftlancer/ui/button";
import { layoutGapClass } from "@loftlancer/ui/layout-spacing";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@loftlancer/ui/menu";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { HorizontalScrollRail } from "@loftlancer/ui/patterns/horizontal-scroll-rail";
import { Tabs, TabsList, TabsTab } from "@loftlancer/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { appIcons, iconMutedClassName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useEnvironmentVariableCounts } from "../hooks/use-environment-variable-counts";
import { CreateEnvironmentSheet } from "./create-environment-sheet";
import { DeleteEnvironmentDialog } from "./delete-environment-dialog";
import { EditEnvironmentSheet } from "./edit-environment-sheet";
import { EnvironmentTabCountBadge } from "./environment-tab-count-badge";

interface Environment {
  id: string;
  name: string;
  slug?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
  updatedBy?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
}

interface EnvironmentsTabsViewProps {
  environments: Environment[];
  activeTab?: string;
  onTabChange: (id: string) => void;
  /** Env is in the URL path: each tab is a real link (#318). */
  tabHref?: (env: Environment) => Route;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  children: (env: Environment) => React.ReactNode;
}

export function EnvironmentsTabsView({
  environments,
  activeTab,
  onTabChange,
  tabHref,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
  children,
}: EnvironmentsTabsViewProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const resolvedActive =
    activeTab && environments.some((e) => e.id === activeTab)
      ? activeTab
      : environments[0]?.id;

  const activeEnvironment = useMemo(
    () => environments.find((e) => e.id === resolvedActive),
    [environments, resolvedActive],
  );

  const variableCounts = useEnvironmentVariableCounts(
    environments.map((env) => env.id),
  );

  if (environments.length === 0) {
    return (
      <EmptyState
        icon={appIcons.environment}
        title="No environments yet"
        description="Add development, staging, or production targets for this project."
        className="h-full"
        action={
          <CreateEnvironmentSheet
            onConfirm={onCreate}
            isPending={isCreating}
            triggerText="Add environment"
          />
        }
      />
    );
  }

  return (
    <section className={cn("flex min-w-0 flex-col", layoutGapClass)}>
      <Tabs
        value={resolvedActive}
        onValueChange={onTabChange}
        className="min-w-0 gap-2"
      >
        <HorizontalScrollRail compactControls className="min-w-0">
          <div className="flex w-max min-w-full items-end gap-1 border-border border-b">
            <TabsList
              variant="underline"
              size="sm"
              className="h-9 min-h-9 w-fit shrink-0 justify-start gap-0 bg-transparent p-0"
            >
              {environments.map((env) => {
                const count = variableCounts[env.id];
                const href = tabHref?.(env);
                return (
                  <TabsTab
                    key={env.id}
                    value={env.id}
                    size="sm"
                    {...(href
                      ? {
                          nativeButton: false,
                          render: <Link href={href} />,
                          // Plain click: swap tabs in place (URL updates via
                          // onTabChange). Modified click: let the browser open
                          // the link and don't switch this page's tab.
                          onClick: (
                            event: React.MouseEvent & {
                              preventBaseUIHandler?: () => void;
                            },
                          ) => {
                            if (
                              event.metaKey ||
                              event.ctrlKey ||
                              event.shiftKey ||
                              event.altKey ||
                              event.button !== 0
                            ) {
                              event.preventBaseUIHandler?.();
                              return;
                            }
                            event.preventDefault();
                          },
                        }
                      : {})}
                    className="h-9 min-h-9 shrink-0 grow-0 gap-1.5 whitespace-nowrap rounded-none px-2.5 data-active:shadow-none"
                  >
                    <AppIcon
                      name="environment"
                      className={cn(iconMutedClassName, "size-4")}
                    />
                    <span className="max-w-[7.5rem] truncate sm:max-w-none">
                      {env.name}
                    </span>
                    <EnvironmentTabCountBadge count={count} />
                  </TabsTab>
                );
              })}
            </TabsList>
            {activeEnvironment ? (
              <Menu>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <MenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="size-8 shrink-0"
                            aria-label="Environment actions"
                          />
                        }
                      />
                    }
                  >
                    <AppIcon name="rowActions" className="text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Environment actions</TooltipContent>
                </Tooltip>
                <MenuPopup align="end">
                  <MenuItem onClick={() => setEditOpen(true)}>
                    <AppIcon name="edit" className="me-2 text-foreground" />
                    Rename
                  </MenuItem>
                  <MenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <AppIcon name="delete" className="me-2 text-foreground" />
                    Delete
                  </MenuItem>
                </MenuPopup>
              </Menu>
            ) : null}
          </div>
        </HorizontalScrollRail>

        <div className="min-w-0">
          {environments.map((env) => (
            <div
              key={env.id}
              role="tabpanel"
              hidden={env.id !== resolvedActive}
              className="min-w-0"
            >
              {children(env)}
            </div>
          ))}
        </div>
      </Tabs>

      {activeEnvironment ? (
        <>
          <EditEnvironmentSheet
            open={editOpen}
            onOpenChange={setEditOpen}
            hideTrigger
            environment={activeEnvironment}
            onConfirm={onUpdate}
            isPending={isUpdating}
          />
          <DeleteEnvironmentDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            hideTrigger
            environmentName={activeEnvironment.name}
            onConfirm={() => onDelete(activeEnvironment.id)}
            isPending={isDeleting}
          />
        </>
      ) : null}
    </section>
  );
}
