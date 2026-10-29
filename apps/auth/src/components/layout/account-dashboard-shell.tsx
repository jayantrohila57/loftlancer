import { AppShell } from "@loftlancer/ui/patterns/app-shell";
import { ModeToggle } from "@loftlancer/ui/patterns/mode-toggle";
import { AccountSettingsSidebar } from "@/components/account-settings-sidebar";
import { SettingsBreadcrumbs } from "@/components/settings-breadcrumbs";
import { UserMenu } from "@/domain/auth/components/user-menu";
import { NotificationBell } from "@/domain/notifications/components/notification-bell";

export function AccountDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      sidebar={<AccountSettingsSidebar />}
      breadcrumbs={<SettingsBreadcrumbs className="flex-nowrap lg:flex-wrap" />}
      headerActions={
        // Same header controls as studio's PrivateDashboardShell (#319).
        <>
          <NotificationBell />
          <ModeToggle compact />
          <UserMenu />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
