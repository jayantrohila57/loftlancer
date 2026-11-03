"use client";

import { headerIconButtonClassName } from "@loftlancer/ui/utils";
import type { ComponentType, ReactNode } from "react";
import { DashboardInsetContainer } from "./shell.dashboard-inset-container";
import { DashboardShellMain } from "./shell.main";
import {
  DashboardPageHeaderBar,
  DashboardPageHeaderRow,
} from "./shell.page-chrome";

export const dashboardSidebarInsetClassName =
  "flex h-svh max-h-svh min-h-0 flex-col overflow-hidden md:h-[calc(100svh-0.5rem)] md:max-h-[calc(100svh-0.5rem)]";

export type DashboardShellUiComponents = {
  SidebarInset: ComponentType<{
    id?: string;
    className?: string;
    children: ReactNode;
  }>;
  SidebarTrigger: ComponentType<{
    className?: string;
    variant?: "outline";
  }>;
  Separator: ComponentType<{
    orientation?: "horizontal" | "vertical";
    className?: string;
  }>;
};

export type DashboardAppShellProps = {
  components: DashboardShellUiComponents;
  sidebar: ReactNode;
  breadcrumbs: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  mainId?: string;
};

/**
 * Shared Loftlancer dashboard chrome: sidebar inset, header row, scrollable main.
 * Apps supply shadcn sidebar primitives from their local `components/ui/*`.
 */
export function DashboardAppShell({
  components: { SidebarInset, SidebarTrigger, Separator },
  sidebar,
  breadcrumbs,
  headerActions,
  children,
  mainId = "main-content",
}: DashboardAppShellProps) {
  return (
    <>
      {sidebar}
      <SidebarInset id={mainId} className={dashboardSidebarInsetClassName}>
        <DashboardPageHeaderBar className="border-border/60 justify-center">
          <DashboardInsetContainer>
            <DashboardPageHeaderRow>
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <SidebarTrigger
                  variant="outline"
                  className={`${headerIconButtonClassName} max-md:size-10`}
                />
                <Separator
                  orientation="vertical"
                  className="my-auto hidden h-4 lg:block"
                />
                <div className="hidden min-w-0 flex-1 lg:block">
                  {breadcrumbs}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden lg:hidden">
                  {breadcrumbs}
                </div>
              </div>
              {headerActions ? (
                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                  {headerActions}
                </div>
              ) : null}
            </DashboardPageHeaderRow>
          </DashboardInsetContainer>
        </DashboardPageHeaderBar>
        <DashboardShellMain
          variant="dashboard"
          padding="none"
          scale="dashboard"
          className="isolate max-w-full min-w-0"
        >
          <DashboardInsetContainer className="min-w-0 pb-2">
            {children}
          </DashboardInsetContainer>
        </DashboardShellMain>
      </SidebarInset>
    </>
  );
}
