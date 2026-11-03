"use client";

import { LocalDateTime } from "@features/patterns/core/client/patterns.local-date-time";
import { Avatar, AvatarFallback } from "@loftlancer/ui/avatar";
import { Button } from "@loftlancer/ui/button";
import { Card, CardHeader, CardPanel } from "@loftlancer/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import type { ProjectOutput } from "@modules/projects/utils/types/utils.project.dto";
import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import { initialsFromLabel } from "@/lib/initials";
import { prefetchProjectDetail } from "@/lib/prefetch-project-detail";
import { ProjectActions } from "@/module/projects/projects.project.actions";
import { routes } from "@/utils/navigation";
import { queryClient } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";

export function ProjectCard({ project }: { project: ProjectOutput }) {
  const org = useOrgSlug();
  const href = routes.project(org, project.slug);
  const description = project.description?.trim();

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="gap-2 p-3 pb-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-muted text-xs font-medium">
              {initialsFromLabel(project.name, "PR")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start gap-2">
              <Link
                href={href}
                className="min-w-0 flex-1 truncate text-sm leading-tight font-medium hover:underline"
                onMouseEnter={() =>
                  prefetchProjectDetail(queryClient, project.slug)
                }
                onFocus={() => prefetchProjectDetail(queryClient, project.slug)}
              >
                {project.name}
              </Link>
              <div className="shrink-0">
                <ProjectActions project={project} />
              </div>
            </div>
            {description ? (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                {description}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <VisibilityBadge isPublic={project.isPublic} />
              {project.isArchived ? (
                <StatusBadge status="archived" />
              ) : (
                <StatusBadge status={project.status} />
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardPanel className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 px-3 pt-1 pb-3 text-xs">
        <span className="tabular-nums">
          Updated <LocalDateTime value={project.updatedAt} showTimeOnHover />
        </span>
        <div className="flex items-center gap-0.5">
          {project.repositoryUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    aria-label={`GitHub repository for ${project.name} (opens in a new tab)`}
                    title="GitHub repository"
                    render={
                      <Link
                        href={project.repositoryUrl as Route}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  />
                }
              >
                <AppIcon name="github" className="size-3.5 text-current" />
              </TooltipTrigger>
              <TooltipContent>GitHub repository</TooltipContent>
            </Tooltip>
          ) : null}
          {project.websiteUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    aria-label={`Website for ${project.name} (opens in a new tab)`}
                    title="Website"
                    render={
                      <Link
                        href={project.websiteUrl as Route}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  />
                }
              >
                <AppIcon
                  name="externalLink"
                  className="size-3.5 text-current"
                />
              </TooltipTrigger>
              <TooltipContent>Website</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </CardPanel>
    </Card>
  );
}
