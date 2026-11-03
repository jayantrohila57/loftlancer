"use client";

import { Separator } from "@loftlancer/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@loftlancer/ui/sidebar";
import { TooltipProvider } from "@loftlancer/ui/tooltip";
import type { ReactNode } from "react";
import { DashboardAppShell } from "./shell.dashboard-app-shell";

const shellComponents = { SidebarInset, SidebarTrigger, Separator };

/**
 * The one dashboard shell: shadcn Sidebar + SidebarInset with the sticky
 * header (trigger, breadcrumb, actions). Used by the studio dashboard
 * (incl. org settings) and the auth account settings.
 */
export function AppShell({
  sidebar,
  breadcrumbs,
  headerActions,
  children,
}: {
  sidebar: ReactNode;
  breadcrumbs?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <TooltipProvider delay={0}>
        <DashboardAppShell
          components={shellComponents}
          sidebar={sidebar}
          breadcrumbs={breadcrumbs}
          headerActions={headerActions}
        >
          {children}
        </DashboardAppShell>
      </TooltipProvider>
    </SidebarProvider>
  );
}

/**
 * Public (unguarded) mode of the same shell for static pages such as legal:
 * no session on the server, no prefetch. Pass a `PublicSidebar`.
 */
export function PublicAppShell({
  sidebar,
  title,
  children,
}: {
  sidebar: ReactNode;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell
      sidebar={sidebar}
      breadcrumbs={
        title ? <span className="truncate text-sm">{title}</span> : null
      }
    >
      {children}
    </AppShell>
  );
}
