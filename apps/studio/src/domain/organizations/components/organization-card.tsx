"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Card, CardHeader, CardPanel } from "@loftlancer/ui/card";
import Link from "next/link";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { AppIcon } from "@/components/patterns/app-icon";
import { initialsFromLabel } from "@/lib/initials";
import { isPersonalOrganization } from "@/lib/org-personal";
import { cn } from "@/lib/utils";

import { routes } from "@/utils/navigation";

export function OrganizationCard({
  org,
  isActive,
}: {
  org: OrgListItem;
  isActive: boolean;
}) {
  const href = routes.org(org.slug);
  const personal = isPersonalOrganization(org);

  return (
    <Card
      className={cn(
        "flex h-full min-w-0 flex-col transition-colors hover:border-primary/30",
        isActive && "border-primary/40 ring-1 ring-primary/20",
      )}
    >
      <CardHeader className="gap-2 p-4 pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={org.logo ?? undefined} alt="" />
            <AvatarFallback className="bg-muted font-medium text-xs">
              {initialsFromLabel(org.name, "OR")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Link
              href={href}
              className="truncate font-medium text-sm leading-tight hover:underline"
            >
              {org.name}
            </Link>
            <p className="mt-1 font-mono text-muted-foreground text-xs">
              {org.slug}
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              {personal ? "Personal workspace" : "Team workspace"}
              {isActive ? " · Active" : null}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardPanel className="mt-auto flex items-center justify-end px-4 pb-4">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
        >
          Open
          <AppIcon name="chevronRight" className="size-3.5" />
        </Link>
      </CardPanel>
    </Card>
  );
}
