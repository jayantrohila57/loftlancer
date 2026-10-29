"use client";

import { Button } from "@loftlancer/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@loftlancer/ui/menu";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { appIcons } from "@/lib/icons";
import { CreateEnvironmentSheet } from "@/module/environments/environments.create.environment.sheet";
import { DeleteEnvironmentDialog } from "@/module/environments/environments.delete.environment.dialog";
import { EditEnvironmentSheet } from "@/module/environments/environments.edit.environment.sheet";

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
    <section className="flex min-w-0 flex-col gap-3">
      <div key={resolvedActive} className="flex min-w-0 flex-col gap-3">
        {environments.map((env) => {
          const href = tabHref?.(env);
          const selected = env.id === resolvedActive;
          return (
            <AccordionSection
              key={env.id}
              title={
                <span className="flex items-center gap-2">
                  <AppIcon name="environment" className="size-4" />
                  {href ? <Link href={href}>{env.name}</Link> : env.name}
                </span>
              }
              defaultOpen={selected}
              onToggle={(open) => {
                if (open && !selected) onTabChange(env.id);
              }}
            >
              {selected && activeEnvironment ? (
                <div className="mb-3 flex justify-end">
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
                        <AppIcon
                          name="rowActions"
                          className="text-foreground"
                        />
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
                        <AppIcon
                          name="delete"
                          className="me-2 text-foreground"
                        />
                        Delete
                      </MenuItem>
                    </MenuPopup>
                  </Menu>
                </div>
              ) : null}
              {selected ? children(env) : null}
            </AccordionSection>
          );
        })}
      </div>
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
