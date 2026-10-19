"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Avatar, AvatarFallback } from "@loftlancer/ui/avatar";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@loftlancer/ui/collapsible";
import { ProjectPinMenu } from "@loftlancer/ui/patterns/sidebar-kit";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@loftlancer/ui/sidebar";
import { ChevronRight, ChevronUp, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { AppIcon } from "@/components/patterns/app-icon";
import { SidebarProjectApps } from "@/components/sidebar-project-apps";
import { initialsFromLabel } from "@/lib/initials";
import { prefetchProjectDetail } from "@/lib/prefetch-project-detail";
import { selectSidebarProjects } from "@/lib/sidebar-project-nav";
import { cn } from "@/lib/utils";

import { routes } from "@/utils/navigation";
import { queryClient } from "@/utils/trpc";
import { useRouteScope } from "@/utils/use-route-scope";

const PROJECTS_GROUP_OPEN_KEY = "loftlancer-sidebar-projects-open";
const PROJECTS_LIST_EXPANDED_KEY = "loftlancer-sidebar-projects-list-expanded";

function readStoredBoolean(key: string, defaultValue: boolean) {
  if (typeof window === "undefined") return defaultValue;
  const raw = window.localStorage.getItem(key);
  if (raw === "0") return false;
  if (raw === "1") return true;
  return defaultValue;
}

function projectPathActive(pathname: string, org: string, slug: string) {
  const href = routes.project(org, slug);
  return pathname === href;
}

export function SidebarProjectsGroup({
  organizationSlug,
  projects,
  projectsLoading,
  status,
  onRetry,
  isPinned,
  onTogglePin,
  pinPending,
  favoriteCount = 0,
  favoriteLimit = 3,
}: {
  organizationSlug?: string | null;
  isPinned?: (projectId: string) => boolean;
  onTogglePin?: (projectId: string) => void;
  pinPending?: boolean;
  favoriteCount?: number;
  favoriteLimit?: number;
  projects: ProjectOutput[];
  projectsLoading: boolean;
  status: "loading" | "error" | "empty" | "success";
  onRetry: () => void;
}) {
  const currentOrgSlug = useCurrentOrgSlug();
  const org = organizationSlug ?? currentOrgSlug ?? "";
  const pathname = usePathname();
  const [groupOpen, setGroupOpen] = useState(true);
  const [listExpanded, setListExpanded] = useState(false);

  useEffect(() => {
    setGroupOpen(readStoredBoolean(PROJECTS_GROUP_OPEN_KEY, true));
    setListExpanded(readStoredBoolean(PROJECTS_LIST_EXPANDED_KEY, false));
  }, []);

  const activeSlug = useRouteScope().project ?? null;

  const { visible, listToggleVisible } = useMemo(
    () =>
      selectSidebarProjects({
        projects,
        activeSlug,
        listExpanded,
      }),
    [activeSlug, listExpanded, projects],
  );

  const persistGroupOpen = (open: boolean) => {
    setGroupOpen(open);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECTS_GROUP_OPEN_KEY, open ? "1" : "0");
    }
  };

  const persistListExpanded = (open: boolean) => {
    setListExpanded(open);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECTS_LIST_EXPANDED_KEY, open ? "1" : "0");
    }
  };

  if (!org) return null;

  return (
    <Collapsible
      open={groupOpen}
      onOpenChange={persistGroupOpen}
      className="group/projects-collapsible"
    >
      <SidebarGroup className="p-2">
        <CollapsibleTrigger
          render={
            <SidebarGroupLabel className="cursor-pointer gap-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          }
        >
          <span className="min-w-0 flex-1 truncate">Projects</span>
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              groupOpen && "rotate-90",
            )}
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <SidebarGroupContent>
            <SidebarMenu className="flex min-w-0 flex-col gap-1">
              {projectsLoading &&
                [62, 68, 74].map((textWidthPercent) => (
                  <SidebarMenuItem key={`project-skeleton-${textWidthPercent}`}>
                    <SidebarMenuSkeleton
                      showIcon
                      textWidthPercent={textWidthPercent}
                    />
                  </SidebarMenuItem>
                ))}
              {!projectsLoading && status === "error" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    onClick={() => void onRetry()}
                  >
                    <AppIcon name="projectFolder" className="text-current" />
                    <span className="text-xs">
                      Couldn't load — tap to retry
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!projectsLoading &&
                status === "empty" &&
                projects.length === 0 && (
                  <SidebarMenuItem className="px-2 py-1">
                    <p className="text-muted-foreground text-xs leading-snug">
                      No projects yet
                    </p>
                  </SidebarMenuItem>
                )}
              {!projectsLoading &&
                visible.map((project) => (
                  <Fragment key={project.id}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={projectPathActive(
                          pathname,
                          org,
                          project.slug,
                        )}
                        tooltip={project.name}
                        render={
                          <Link
                            href={routes.project(org, project.slug)}
                            onMouseEnter={() =>
                              prefetchProjectDetail(queryClient, project.slug)
                            }
                            onFocus={() =>
                              prefetchProjectDetail(queryClient, project.slug)
                            }
                          />
                        }
                      >
                        <Avatar className="size-5 shrink-0">
                          <AvatarFallback className="bg-muted font-medium text-[9px]">
                            {initialsFromLabel(project.name, "PR")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{project.name}</span>
                      </SidebarMenuButton>
                      {onTogglePin ? (
                        <ProjectPinMenu
                          pinned={isPinned?.(project.id) ?? false}
                          pending={pinPending}
                          limitReached={favoriteCount >= favoriteLimit}
                          favoriteLimit={favoriteLimit}
                          onToggle={() => onTogglePin(project.id)}
                        />
                      ) : null}
                    </SidebarMenuItem>
                    {activeSlug === project.slug ? (
                      <SidebarProjectApps slug={project.slug} />
                    ) : null}
                  </Fragment>
                ))}
              {!projectsLoading && listToggleVisible && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    className="text-muted-foreground hover:text-sidebar-accent-foreground"
                    onClick={() => persistListExpanded(!listExpanded)}
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center"
                      aria-hidden
                    >
                      {listExpanded ? (
                        <ChevronUp className="size-3.5 text-muted-foreground" />
                      ) : (
                        <MoreHorizontal className="size-3.5 text-muted-foreground" />
                      )}
                    </span>
                    <span className="truncate">
                      {listExpanded ? "Less" : "More"}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsiblePanel>
      </SidebarGroup>
    </Collapsible>
  );
}
