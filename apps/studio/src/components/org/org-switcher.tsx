"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@loftlancer/ui/sidebar";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { Building2, ChevronsUpDown, Plus, Settings } from "lucide-react";
import Link from "next/link";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { actionToast } from "@/lib/action-toast";
import { initialsFromLabel } from "@/lib/initials";
import { isPersonalOrganization } from "@/lib/org-personal";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

import { routes } from "@/utils/navigation";

function orgSubtitle(org: OrgListItem | undefined): string {
  if (!org) return "Workspace";
  if (isPersonalOrganization(org)) return "Personal";
  return "Team";
}

export function OrgSwitcher() {
  const { state, isMobile } = useSidebar();
  const menuOnRight = state === "collapsed" && !isMobile;
  const {
    orgs,
    activeOrganizationId,
    loading,
    initialLoadDone,
    setActiveOrganization,
  } = useActiveOrganization();

  if (!isOrganizationsEnabledOnClient()) {
    return null;
  }

  const active = orgs.find((o) => o.id === activeOrganizationId) ?? orgs[0];
  const resolvingActiveLabel =
    Boolean(activeOrganizationId) &&
    orgs.length > 0 &&
    !active?.name &&
    !loading;
  const showInitialLoading =
    (!initialLoadDone && loading) || resolvingActiveLabel;

  const onSelectOrg = async (organizationId: string) => {
    if (organizationId === activeOrganizationId) return;
    try {
      await actionToast(setActiveOrganization(organizationId), {
        loading: "Switching organization…",
        success: "Organization switched",
        error: "Could not switch organization",
      });
    } catch {
      // Toast handled by actionToast
    }
  };

  const triggerLabel = showInitialLoading
    ? "Loading organization"
    : (active?.name ?? "Select organization");

  const switcherBody = showInitialLoading ? (
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
        <AvatarImage src={active?.logo ?? undefined} alt="" />
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
          value={activeOrganizationId ?? active?.id ?? null}
          onChange={(id) => void onSelectOrg(id)}
          ariaLabel="Switch organization"
          searchPlaceholder="Search organizations…"
          emptyText="No organizations found"
          side={isMobile ? "top" : menuOnRight ? "right" : "bottom"}
          popupClassName="w-64"
          disabled={showInitialLoading}
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
              <Link
                href={routes.organizationsDirectory()}
                className={linkClass}
              >
                <Settings
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                Manage organizations
              </Link>
              <Link href={routes.newOrganization()} className={linkClass}>
                <Plus className="size-4 text-muted-foreground" aria-hidden />
                Create organization
              </Link>
            </>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
