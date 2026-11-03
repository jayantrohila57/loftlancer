"use client";

import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";
import { AppShell } from "@features/shell/core/client";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ActiveOrganizationProvider } from "@/components/org/active-organization-context";
import { OrgOnboardingGate } from "@/components/org/org-onboarding-gate";
import { UserMenu } from "@/module/auth/auth.user.menu";
import { NotificationBell } from "@/module/notifications/notifications.notification.bell";
import { NotificationPoller } from "@/module/notifications/notifications.notification.poller";

export function PrivateDashboardShell({
  children,
  orgReady = false,
}: {
  children: React.ReactNode;
  /** Server session already has an active org (see OrgOnboardingGate). */
  orgReady?: boolean;
}) {
  return (
    <ActiveOrganizationProvider>
      <NotificationPoller />
      <AppShell
        sidebar={<AppSidebar />}
        breadcrumbs={<Breadcrumbs className="flex-nowrap lg:flex-wrap" />}
        headerActions={
          <>
            <NotificationBell />
            <ModeToggle compact />
            <UserMenu />
          </>
        }
      >
        <OrgOnboardingGate initialReady={orgReady}>
          {children}
        </OrgOnboardingGate>
      </AppShell>
    </ActiveOrganizationProvider>
  );
}
