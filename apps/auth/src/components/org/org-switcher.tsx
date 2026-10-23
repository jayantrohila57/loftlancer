"use client";

import { Avatar, AvatarFallback } from "@loftlancer/ui/avatar";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@loftlancer/ui/sidebar";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { routes } from "@loftlancer/ui/studio-routes";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronsUpDown, Plus, Settings } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { initialsFromLabel } from "@/lib/initials";
import { isPersonalOrganization } from "@/lib/org-personal";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { studioDashboardPath } from "@/lib/studio-url";

type OrgListItem = {
  id: string;
  name: string;
  slug: string;
  metadata?: string | Record<string, unknown> | null;
};

function orgSubtitle(org: OrgListItem | undefined): string {
  if (!org) return "Organization";
  if (isPersonalOrganization(org)) return "Personal";
  return "Team";
}

/**
 * Account settings twin of the studio sidebar org switcher (#319): same
 * trigger, list and footer. Account pages have no org in the URL, so it
 * shows the last active org and picking one opens that org in studio (where
 * the URL org becomes the active org).
 */
export function OrgSwitcher({ activeSlug }: { activeSlug: string | null }) {
  const { state, isMobile } = useSidebar();
  const menuOnRight = state === "collapsed" && !isMobile;
  const enabled = isOrganizationsEnabledOnClient();
  const orgsQuery = useQuery({
    queryKey: ["account-org-switcher", "organizations"],
    queryFn: async () =>
      ((await authClient.organization.list()).data ?? []) as OrgListItem[],
    enabled,
    staleTime: 60_000,
  });

  if (!enabled) return null;

  const orgs = orgsQuery.data ?? [];
  const active = orgs.find((o) => o.slug === activeSlug) ?? orgs[0];
  const loading = orgsQuery.isPending;
  const triggerLabel = loading
    ? "Loading organization"
    : (active?.name ?? "Select organization");

  const switcherBody = loading ? (
    <>
      <Skeleton className="size-8 shrink-0 rounded-lg" />
      <div className="grid min-w-0 flex-1 gap-0.5 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </>
  ) : (
    <>
      <Avatar className="size-8 shrink-0 rounded-lg">
        <AvatarFallback className="rounded-lg text-xs">
          {active?.name ? initialsFromLabel(active.name, "OR") : "OR"}
        </AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 gap-0.5 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-medium">
          {active?.name ?? "Select organization"}
        </span>
        <span className="truncate text-muted-foreground text-xs">
          {orgSubtitle(active)}
        </span>
      </div>
      {!isMobile ? (
        <ChevronsUpDown
          className="ms-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
          aria-hidden
        />
      ) : null}
    </>
  );

  const linkClass =
    "flex h-8 items-center gap-2 rounded-sm px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SearchableCombobox
          value={active?.id ?? null}
          onChange={(id) => {
            const org = orgs.find((o) => o.id === id);
            if (org)
              window.location.assign(studioDashboardPath(routes.org(org.slug)));
          }}
          ariaLabel="Switch organization"
          searchPlaceholder="Search organizations…"
          emptyText="No organizations found"
          side={isMobile ? "top" : menuOnRight ? "right" : "bottom"}
          popupClassName="w-64"
          disabled={loading}
          options={orgs.map((org) => ({
            value: org.id,
            label: org.name,
            hint: orgSubtitle(org),
            icon: (
              <Building2 className="size-4 text-muted-foreground" aria-hidden />
            ),
          }))}
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              tooltip={triggerLabel}
            />
          }
          triggerContent={switcherBody}
          footer={
            <>
              <a
                href={studioDashboardPath(routes.home())}
                className={linkClass}
              >
                <Settings
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                Manage organizations
              </a>
              <a
                href={studioDashboardPath(routes.newOrganization())}
                className={linkClass}
              >
                <Plus className="size-4 text-muted-foreground" aria-hidden />
                New organization
              </a>
            </>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
