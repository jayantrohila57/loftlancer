"use client";

import { type PlatformNavKey, platformNav } from "@loftlancer/actions/nav";
import { MAX_SIDEBAR_FAVORITES } from "@loftlancer/api/sidebar-favorites";
import {
  NavCountBadge,
  SidebarBrand,
  SidebarFavorites,
  SidebarSearch,
  SidebarSettingsLink,
} from "@loftlancer/ui/patterns/sidebar-kit";
import { VersionBadge } from "@loftlancer/ui/patterns/version-badge";
import { docsSiteUrl, docsUrl } from "@loftlancer/ui/platform-urls";
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
  SidebarSeparator,
  useSidebar,
} from "@loftlancer/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  BookOpenIcon,
  Building2,
  CircleHelpIcon,
  FolderClosedIcon,
  LifeBuoyIcon,
  SparklesIcon,
  UsersRound,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSwitcher } from "@/components/org/org-switcher";
import { useSidebarNavigator } from "@/components/sidebar/use-sidebar-navigator";
import { SidebarProjectsGroup } from "@/components/sidebar-projects-group";
import { useNotificationsUnreadCount } from "@/domain/notifications/hooks/use-notifications";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { accountSettingsUrl } from "@/lib/account-url";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { withBasePath } from "@/lib/base-path";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { isSidebarRouteActive } from "@/lib/sidebar-project-nav";
import { platformNavHref, routes } from "@/utils/navigation";
import { useRouteScope } from "@/utils/use-route-scope";

const accountSettingsHref = accountSettingsUrl();
const changelogHref = `${docsSiteUrl()}/changelog`;
const footerLinks = [
  {
    label: "Help Center",
    href: withBasePath(routes.supportHelp()),
    icon: CircleHelpIcon,
  },
  { label: "Documentation", href: docsUrl(), icon: BookOpenIcon },
  {
    label: "Support",
    href: withBasePath(routes.supportTickets()),
    icon: LifeBuoyIcon,
  },
];
const projectHref = (org: string, slug: string) => routes.project(org, slug);
const envHref = (org: string, p: string, e: string) => routes.env(org, p, e);
const memberHref = (org: string) => routes.orgSection(org, "members");
const teamsHref = (org: string, teamId?: string) =>
  teamId ? routes.team(org, teamId) : routes.orgSection(org, "teams");

const navIcons: Record<PlatformNavKey, LucideIcon> = {
  organizations: Building2,
  projects: FolderClosedIcon,
  activity: ActivityIcon,
  notifications: BellIcon,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const scope = useRouteScope();

  useEffect(() => {
    if (isMobile && pathname !== null) setOpenMobile(false);
  }, [isMobile, pathname, setOpenMobile]);
  const settingsLinks = [
    { label: "Account settings", href: accountSettingsHref },
    { label: "Notifications", href: routes.notifications() },
    { label: "Activity", href: routes.activity() },
    { label: "Support", href: routes.supportTickets() },
    { label: "Organizations", href: routes.organizations() },
  ];
  const nav = useSidebarNavigator({
    projectHref,
    envHref,
    memberHref,
    teamHref: teamsHref,
    settingsLinks,
  });
  const teams =
    nav.groups.find((group) => group.heading === "Teams")?.items ?? [];
  const orgSlug = scope.org;
  const navigate = (href: string) => {
    if (/^https?:/.test(href)) window.location.assign(href);
    else router.push(href as Route);
  };
  const { isSwitching } = useActiveOrganization();
  const { projects, status, refetch } = useProjects();
  const projectsLoading = isSwitching || status === "loading";
  const showOrgSwitcher = isOrganizationsEnabledOnClient();
  const notificationsEnabled = isNotificationsEnabledOnClient();
  const unreadNotifications = useNotificationsUnreadCount();
  const notificationCount = notificationsEnabled
    ? unreadNotifications.isPending
      ? null
      : (unreadNotifications.data?.data ?? 0)
    : 0;

  const actionsAudit = isActionsAuditEnabledOnClient();
  const permissions = useCan("organization.list");
  const canTimeline = useCan("audit.timeline.view.org");
  const menuItems = platformNav
    .filter((item) => {
      // Scoped navigation belongs to the organization and project groups below.
      if (item.key === "projects") return false;
      if (item.key === "activity" && orgSlug) return false;
      if (item.key === "notifications") return notificationsEnabled;
      if (item.key === "organizations") {
        return (
          showOrgSwitcher &&
          (!actionsAudit || permissions.allowed || permissions.isLoading)
        );
      }
      return true;
    })
    .flatMap((item) => {
      const href = platformNavHref(item.key, orgSlug);
      if (!href) return [];
      return [
        {
          key: item.key,
          href: href as Route,
          label: item.key === "activity" ? "My activity" : item.label,
          icon: navIcons[item.key],
          count:
            item.key === "notifications"
              ? notificationCount
              : item.key === "organizations"
                ? nav.counts?.pendingInvites
                : 0,
        },
      ];
    });

  const pathMatchesNavItem = (href: string) => {
    if (pathname === href) return true;
    if (href === routes.home()) return pathname === href;
    return pathname.startsWith(`${href}/`);
  };

  const isActive = (href: string) => {
    const sortedItems = [...menuItems].sort(
      (a, b) => b.href.length - a.href.length,
    );

    const activeItem = sortedItems.find((item) =>
      pathMatchesNavItem(item.href),
    );

    return activeItem?.href === href;
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="shrink-0 gap-2">
        <SidebarBrand href={withBasePath(routes.home())} />
        {showOrgSwitcher ? <OrgSwitcher /> : null}
        <SidebarSearch
          groups={nav.groups}
          loading={nav.loading}
          onNavigate={navigate}
        />
      </SidebarHeader>
      <SidebarContent className="max-md:[&_[data-slot=sidebar-menu-button]]:min-h-11">
        <SidebarGroup>
          <SidebarGroupLabel>Studio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const count = item.count;
                const countLoading =
                  item.key === "notifications"
                    ? unreadNotifications.isPending
                    : nav.loading;
                return (
                  <SidebarMenuItem key={item.key} className="relative">
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    <NavCountBadge
                      count={count}
                      loading={countLoading}
                      tone={item.key === "notifications" ? "alert" : "muted"}
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {orgSlug ? (
          <SidebarGroup>
            <SidebarGroupLabel>Organization</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === routes.org(orgSlug)}
                    tooltip="Organization overview"
                    render={<Link href={routes.org(orgSlug) as Route} />}
                  >
                    <Building2 />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {(!actionsAudit ||
                  canTimeline.allowed ||
                  canTimeline.isLoading) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={
                        pathname === routes.orgSection(orgSlug, "activity")
                      }
                      tooltip="Organization activity"
                      render={
                        <Link
                          href={routes.orgSection(orgSlug, "activity") as Route}
                        />
                      }
                    >
                      <ActivityIcon />
                      <span>Organization activity</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {orgSlug ? (
          <SidebarFavorites
            items={nav.favorites}
            isActive={(href) => isSidebarRouteActive(pathname, href)}
            LinkComponent={({ href, className, children }) => (
              <Link href={href as Route} className={className}>
                {children}
              </Link>
            )}
          />
        ) : null}

        {orgSlug ? (
          <SidebarGroup>
            <SidebarGroupLabel>Teams</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === teamsHref(orgSlug)}
                    tooltip="Teams"
                    render={<Link href={teamsHref(orgSlug) as Route} />}
                  >
                    <UsersRound />
                    <span>All teams</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {teams.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      }
                      tooltip={item.label}
                      render={<Link href={item.href as Route} />}
                    >
                      <UsersRound />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        <SidebarSeparator className="mx-2" />

        {orgSlug ? (
          <SidebarProjectsGroup
            organizationSlug={orgSlug}
            isPinned={nav.isPinned}
            onTogglePin={nav.togglePin}
            pinPending={nav.pinPending}
            favoriteCount={nav.favoriteCount}
            favoriteLimit={MAX_SIDEBAR_FAVORITES}
            projects={projects}
            projectsLoading={projectsLoading}
            status={status}
            onRetry={() => void refetch()}
          />
        ) : null}
      </SidebarContent>

      <SidebarFooter className="mt-auto shrink-0 border-sidebar-border border-t bg-sidebar">
        <div className="mx-2 mb-2 rounded-lg border bg-muted/40 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
          <div className="mb-1 flex items-center gap-2 font-medium text-xs">
            <SparklesIcon className="size-3.5 text-muted-foreground" />
            What&apos;s new?
          </div>
          <p className="font-medium text-sm">Product updates</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            See the latest features and improvements.
          </p>
          <a
            href={changelogHref}
            className="mt-2 inline-flex text-primary text-xs hover:underline"
          >
            Full changelog
          </a>
        </div>
        <SidebarMenu className="gap-1">
          {footerLinks.map(({ label, href, icon: Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton tooltip={label} render={<a href={href} />}>
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSettingsLink href={accountSettingsHref} />
        <div className="flex items-center justify-between gap-2 px-2 pt-1 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span>© {new Date().getFullYear()} Loftlancer</span>
          <VersionBadge href={changelogHref} />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
