"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  pageHeaderMetadataClassName,
  pageHeaderMetadataFieldClassName,
  pageHeaderMetadataLabelClassName,
  pageHeaderMetadataValueClassName,
} from "@/components/layout/page-header-metadata-styles";
import { AppIcon } from "@/components/patterns/app-icon";
import { cn } from "@/lib/utils";

const ghostLinkClassName =
  "h-6 max-w-full gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground";

function formatExternalLinkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function MetadataField({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className={pageHeaderMetadataFieldClassName}>
      <dt className={pageHeaderMetadataLabelClassName}>{label}</dt>
      <dd className={cn(pageHeaderMetadataValueClassName, mono && "font-mono")}>
        {value}
      </dd>
    </div>
  );
}

function MetadataLinkField({
  label,
  href,
  icon,
  tooltip,
}: {
  label: string;
  href: string;
  icon: "github" | "externalLink";
  tooltip: string;
}) {
  const linkLabel = formatExternalLinkLabel(href);

  return (
    <div className={pageHeaderMetadataFieldClassName}>
      <dt className={pageHeaderMetadataLabelClassName}>{label}</dt>
      <dd className={pageHeaderMetadataValueClassName}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className={cn(ghostLinkClassName, "ms-auto")}
                render={
                  <Link
                    href={href as Route}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                  />
                }
              />
            }
          >
            <AppIcon name={icon} className="size-3.5 shrink-0 text-current" />
            <span className="truncate">{linkLabel}</span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </dd>
    </div>
  );
}

export function ProjectMetadataRow({
  project,
  className,
}: {
  project: ProjectOutput;
  className?: string;
}) {
  return (
    <dl
      data-slot="page-header-metadata"
      className={cn(pageHeaderMetadataClassName, className)}
    >
      <MetadataField label="Slug" value={project.slug} mono />
      <MetadataField
        label="Updated"
        value={<LocalDateTime value={project.updatedAt} showTimeOnHover />}
      />
      {project.repositoryUrl ? (
        <MetadataLinkField
          label="Repository"
          href={project.repositoryUrl}
          icon="github"
          tooltip="Open repository"
        />
      ) : null}
      {project.websiteUrl ? (
        <MetadataLinkField
          label="Website"
          href={project.websiteUrl}
          icon="externalLink"
          tooltip="Open website"
        />
      ) : null}
    </dl>
  );
}
