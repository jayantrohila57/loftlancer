"use client";

import {
  accountSettingsNav,
  type PlatformNavKey,
  platformNav,
} from "@loftlancer/actions/nav";
import {
  NavCountBadge,
  SidebarBrand,
  SidebarFavorites,
  SidebarSearch,
  SidebarUserMenu,
} from "@loftlancer/ui/patterns/sidebar-kit";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@loftlancer/ui/sidebar";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { platformNavHref, routes } from "@loftlancer/ui/studio-routes";
import type { LucideIcon } from "lucide-react";
import { BellIcon, Building2, ClockIcon, FolderClosedIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { OrgSwitcher } from "@/components/org/org-switcher";
import { useSidebarNavigator } from "@/components/sidebar/use-sidebar-navigator";
import { useUserMenuProps } from "@/domain/auth/components/user-menu";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { studioDashboardPath } from "@/lib/studio-url";

/**
 * Account sections are not repeated here: the settings header tabs are the
 * section nav, like studio pages (#329).
 */

/** Studio platform nav, mirrored from the studio AppSidebar with absolute /studio URLs. */
const studioNavIcons: Record<PlatformNavKey, LucideIcon> = {
  overview: FolderClosedIcon,
  organizations: Building2,
  projects: FolderClosedIcon,
  activity: ClockIcon,
  notifications: BellIcon,
};

const projectHref = (org: string, slug: string) =>
  studioDashboardPath(routes.project(org, slug));
const envHref = (org: string, p: string, e: string) =>
  studioDashboardPath(routes.env(org, p, e));
const memberHref = (org: string) =>
  studioDashboardPath(routes.orgSection(org, "members"));

export function AccountSettingsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const canProfile = useCan("profile.view");
  const canSessions = useCan("session.list");
  const canAccounts = useCan("account.list");
  const canDelete = useCan("account.delete");
  const canTimeline = useCan("audit.timeline.view.self");
  const canNotifications = useCan("notification.list");

  const notificationsEnabled = isNotificationsEnabledOnClient();
  const actionsAudit = isActionsAuditEnabledOnClient();

  const allowedByHref: Record<string, boolean> = {
    "/settings/profile": canProfile.allowed || canProfile.isLoading,
    "/settings/security": canSessions.allowed || canSessions.isLoading,
    "/settings/sessions": canSessions.allowed || canSessions.isLoading,
    "/settings/accounts": canAccounts.allowed || canAccounts.isLoading,
    "/settings/notifications":
      notificationsEnabled &&
      (canNotifications.allowed || canNotifications.isLoading),
    "/settings/danger": canDelete.allowed || canDelete.isLoading,
    "/settings/timeline":
      actionsAudit && (canTimeline.allowed || canTimeline.isLoading),
  };

  const studioItems = platformNav.filter((item) => {
    if (item.key === "notifications") return notificationsEnabled;
    if (item.key === "organizations") return isOrganizationsEnabledOnClient();
    if (item.key === "activity") return actionsAudit;
    return true;
  });

  const items = accountSettingsNav.filter(
    (item) => allowedByHref[item.href] !== false,
  );

  const router = useRouter();
  const { ready: _userMenuReady, ...userMenuProps } = useUserMenuProps();
  const nav = useSidebarNavigator({
    projectHref,
    envHref,
    memberHref,
    settingsLinks: items.map((i) => ({ label: i.label, href: i.href })),
  });
  const navigate = (href: string) => {
    if (href.startsWith("/settings")) router.push(href as Route);
    else window.location.assign(href);
  };
  const studioCount = (key: PlatformNavKey) =>
    key === "notifications"
      ? nav.counts?.unreadNotifications
      : key === "projects"
        ? nav.counts?.projects
        : key === "organizations"
          ? nav.counts?.pendingInvites
          : 0;

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="shrink-0 gap-2">
        <SidebarBrand href={studioDashboardPath(routes.home())} />
        {isOrganizationsEnabledOnClient() ? (
          <OrgSwitcher activeSlug={nav.organizationSlug} />
        ) : null}
        <SidebarSearch
          groups={nav.groups}
          loading={nav.loading}
          onNavigate={navigate}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {studioItems.map((item) => {
                const path = platformNavHref(item.key, nav.organizationSlug);
                if (!path) return null;
                const Icon = studioNavIcons[item.key];
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={false}
                      tooltip={
                        item.key === "activity"
                          ? nav.organizationSlug
                            ? "Organization activity"
                            : "My activity"
                          : item.label
                      }
                      render={<a href={studioDashboardPath(path)} />}
                    >
                      <Icon />
                      <span>
                        {item.key === "activity"
                          ? nav.organizationSlug
                            ? "Organization activity"
                            : "My activity"
                          : item.label}
                      </span>
                    </SidebarMenuButton>
                    <NavCountBadge
                      count={studioCount(item.key)}
                      tone={item.key === "notifications" ? "alert" : "muted"}
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFavorites items={nav.favorites} />
      </SidebarContent>

      <SidebarFooter className="mt-auto shrink-0 border-sidebar-border border-t bg-sidebar">
        {_userMenuReady ? (
          <SidebarUserMenu {...userMenuProps} />
        ) : (
          <div
            aria-label="Loading account"
            aria-busy="true"
            className="flex h-12 items-center gap-2 px-2"
            role="status"
          >
            <Skeleton className="size-8 rounded-md" />
            <span className="grid flex-1 gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </span>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
