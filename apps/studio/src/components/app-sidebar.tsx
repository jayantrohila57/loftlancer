"use client";

import { type PlatformNavKey, platformNav } from "@loftlancer/actions/nav";
import { MAX_SIDEBAR_FAVORITES } from "@loftlancer/api/sidebar-favorites";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@loftlancer/ui/collapsible";
import {
  NavCountBadge,
  SidebarBrand,
  SidebarFavorites,
  SidebarSearch,
} from "@loftlancer/ui/patterns/sidebar-kit";
import { docsUrl } from "@loftlancer/ui/platform-urls";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@loftlancer/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BellIcon,
  BookOpenIcon,
  Building2,
  ChevronRight,
  CircleHelpIcon,
  FolderClosedIcon,
  LifeBuoyIcon,
  SettingsIcon,
  Star,
  UserIcon,
  UsersRound,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { useOrganizationFavorites } from "@/components/org/use-organization-favorites";
import { useSidebarNavigator } from "@/components/sidebar/use-sidebar-navigator";
import { SidebarProjectsGroup } from "@/components/sidebar-projects-group";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { useProjects } from "@/domain/projects/hooks/use-projects";
import { accountSettingsUrl } from "@/lib/account-url";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";
import { withBasePath } from "@/lib/base-path";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { isSidebarRouteActive } from "@/lib/sidebar-project-nav";
import { teamDisplayName } from "@/module/organizations/organizations.team.display.name";
import { platformNavHref, routes } from "@/utils/navigation";

const accountSettingsHref = accountSettingsUrl();
const orgListLimit = 4;
const footerGroups = [
  {
    title: "Help & Support",
    items: [
      {
        label: "Help Center",
        href: routes.supportHelp(),
        icon: CircleHelpIcon,
      },
      { label: "Documentation", href: docsUrl(), icon: BookOpenIcon },
      { label: "Support", href: routes.supportTickets(), icon: LifeBuoyIcon },
    ],
  },
  {
    title: "Settings & Account",
    items: [
      { label: "Settings", href: accountSettingsHref, icon: SettingsIcon },
      {
        label: "Account",
        href: accountSettingsUrl("/settings/profile"),
        icon: UserIcon,
      },
    ],
  },
];
const projectHref = (org: string, slug: string) => routes.project(org, slug);
const envHref = (org: string, project: string, env: string) =>
  routes.env(org, project, env);
const memberHref = (org: string) => routes.orgSection(org, "members");
const teamHref = (org: string, id?: string) =>
  id ? routes.team(org, id) : routes.orgSection(org, "teams");
const navIcons: Record<PlatformNavKey, LucideIcon> = {
  overview: FolderClosedIcon,
  organizations: Building2,
  projects: FolderClosedIcon,
  activity: ActivityIcon,
  notifications: BellIcon,
};

function SidebarNavGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarGroup>
        <CollapsibleTrigger
          render={
            <SidebarGroupLabel className="cursor-pointer gap-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          }
        >
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <ChevronRight
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </CollapsiblePanel>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const { orgs, initialLoadDone } = useActiveOrganization();
  const {
    favorites: favoriteOrganizationIds,
    toggleFavorite,
    retainOrganizations,
    favoriteLimit: organizationFavoriteLimit,
  } = useOrganizationFavorites();
  const orgSlug = useCurrentOrgSlug();
  const showOrganizations = isOrganizationsEnabledOnClient();
  const actionsAudit = isActionsAuditEnabledOnClient();
  const canListOrganizations = useCan("organization.list");
  const { projects, status, refetch } = useProjects();
  const nav = useSidebarNavigator({
    projectHref,
    envHref,
    memberHref,
    teamHref,
    settingsLinks: [{ label: "Account settings", href: accountSettingsHref }],
  });
  const organizationName = orgs.find((org) => org.slug === orgSlug)?.name;
  const groups = nav.groups.map((group) =>
    group.heading === "Teams"
      ? {
          ...group,
          items: group.items.map((team) => ({
            ...team,
            label: teamDisplayName(team.label, organizationName),
          })),
        }
      : group,
  );
  const teams = groups.find((group) => group.heading === "Teams")?.items ?? [];
  const menuItems = platformNav.flatMap((item) => {
    if (
      item.key === "projects" ||
      item.key === "activity" ||
      item.key === "notifications"
    )
      return [];
    if (
      item.key === "organizations" &&
      (!showOrganizations ||
        (actionsAudit &&
          !canListOrganizations.allowed &&
          !canListOrganizations.isLoading))
    )
      return [];
    const href = platformNavHref(item.key, orgSlug ?? undefined);
    if (!href) return [];
    return [
      {
        key: item.key,
        href: href as Route,
        label: item.label,
        icon: navIcons[item.key],
      },
    ];
  });
  useEffect(() => {
    if (isMobile && pathname !== null) setOpenMobile(false);
  }, [isMobile, pathname, setOpenMobile]);
  useEffect(() => {
    if (initialLoadDone) {
      retainOrganizations(orgs.map((org) => org.id));
    }
  }, [initialLoadDone, orgs, retainOrganizations]);

  const navigate = (href: string) => {
    if (/^https?:/.test(href)) window.location.assign(href);
    else router.push(href as Route);
  };
  const orgHrefActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const favoriteOrganizations = favoriteOrganizationIds
    .map((id) => orgs.find((org) => org.id === id))
    .filter((org): org is (typeof orgs)[number] => Boolean(org));
  const regularOrganizations = orgs.filter(
    (org) => !favoriteOrganizationIds.includes(org.id),
  );

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="shrink-0 gap-2">
        <SidebarBrand href={withBasePath(routes.overview())} />
        <SidebarSearch
          groups={groups}
          loading={nav.loading}
          onNavigate={navigate}
        />
      </SidebarHeader>
      <SidebarContent className="max-md:[&_[data-slot=sidebar-menu-button]]:min-h-11">
        <SidebarNavGroup title="General">
          <SidebarMenu className="flex min-w-0 flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={
                      item.key === "organizations"
                        ? pathname === routes.organizations() &&
                          searchParams.get("directory") === "1"
                        : pathname === item.href
                    }
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <Icon />
                    <span>{item.label}</span>
                    {item.key === "organizations" ? (
                      <NavCountBadge count={nav.counts?.pendingInvites} />
                    ) : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            <li className="px-2 pt-2 pb-1 text-muted-foreground text-xs">
              Favorite organizations
            </li>
            {favoriteOrganizations.length === 0 ? (
              <li className="px-2 pb-1 text-muted-foreground text-xs">
                Star up to 3 organizations for quick access.
              </li>
            ) : null}
            {favoriteOrganizations.map((org) => {
              const href = routes.org(org.slug);
              return (
                <SidebarMenuItem key={`favorite-${org.id}`}>
                  <SidebarMenuButton
                    isActive={orgHrefActive(href)}
                    tooltip={org.name}
                    render={<Link href={href as Route} />}
                  >
                    <Building2 />
                    <span className="truncate">{org.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    aria-label={`Remove ${org.name} from favorites`}
                    onClick={() => toggleFavorite(org.id)}
                  >
                    <Star className="fill-current" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              );
            })}
            {regularOrganizations.slice(0, orgListLimit).map((org) => {
              const href = routes.org(org.slug);
              return (
                <SidebarMenuItem key={org.id}>
                  <SidebarMenuButton
                    isActive={orgHrefActive(href)}
                    tooltip={org.name}
                    render={<Link href={href as Route} />}
                  >
                    <Building2 />
                    <span className="truncate">{org.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    aria-label={`Add ${org.name} to favorites`}
                    disabled={
                      favoriteOrganizationIds.length >=
                      organizationFavoriteLimit
                    }
                    onClick={() => toggleFavorite(org.id)}
                  >
                    <Star />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              );
            })}
            {regularOrganizations.length > orgListLimit ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="More organizations"
                  render={<Link href={routes.organizationsDirectory()} />}
                >
                  <ChevronRight />
                  <span>More…</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarNavGroup>

        {orgSlug ? (
          <>
            <SidebarFavorites
              items={nav.favorites}
              isActive={(href) => isSidebarRouteActive(pathname, href)}
              LinkComponent={({ href, className, children }) => (
                <Link href={href as Route} className={className}>
                  {children}
                </Link>
              )}
            />
            <SidebarNavGroup title="Teams">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === teamHref(orgSlug)}
                    tooltip="Teams"
                    render={<Link href={teamHref(orgSlug) as Route} />}
                  >
                    <UsersRound />
                    <span>All teams</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {teams.map((team) => (
                  <SidebarMenuItem key={team.id}>
                    <SidebarMenuButton
                      isActive={orgHrefActive(team.href)}
                      tooltip={team.label}
                      render={<Link href={team.href as Route} />}
                    >
                      <UsersRound />
                      <span>{team.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarNavGroup>
            <SidebarProjectsGroup
              organizationSlug={orgSlug}
              isPinned={nav.isPinned}
              onTogglePin={nav.togglePin}
              pinPending={nav.pinPending}
              favoriteCount={nav.favoriteCount}
              favoriteLimit={MAX_SIDEBAR_FAVORITES}
              projects={projects}
              projectsLoading={status === "loading"}
              status={status}
              onRetry={() => void refetch()}
            />
          </>
        ) : null}
      </SidebarContent>
      <SidebarFooter className="mt-auto shrink-0 border-sidebar-border border-t bg-sidebar">
        {footerGroups.map(({ title, items }) => (
          <SidebarNavGroup key={title} title={title} defaultOpen={false}>
            <SidebarMenu className="gap-1">
              {items.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    tooltip={label}
                    render={
                      /^https?:/.test(href) ? (
                        <a href={href}>{label}</a>
                      ) : (
                        <Link href={href as Route} />
                      )
                    }
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarNavGroup>
        ))}
        <div className="flex items-center gap-2 px-2 pt-1 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span>© {new Date().getFullYear()} Loftlancer</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
