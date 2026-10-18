"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import {
  type ActivityFilterOption,
  type ActivityResult,
  ActivityTimeline,
  auditActionFilterOptions,
  auditActorFilterOptions,
  auditProjectFilterOptions,
  auditRowToActivityItem,
} from "@loftlancer/ui/patterns/activity-timeline";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { ErrorState } from "@/components/patterns/error-state";
import {
  CONTACT_MANAGER_DESCRIPTION,
  CONTACT_MANAGER_TITLE,
} from "@/domain/permissions/contact-manager";
import { useUnassignedOrgMember } from "@/domain/permissions/hooks/use-permissions";

import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

type TimelinePageClientProps = {
  scope: "org" | "self";
};

export function TimelinePageClient({ scope }: TimelinePageClientProps) {
  const { unassigned, isLoading: unassignedLoading } = useUnassignedOrgMember();
  const org = useCurrentOrgSlug() ?? "";
  const [action, setAction] = useState("");
  const [actorUserId, setActorUserId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [includePassive, setIncludePassive] = useState(false);
  const [result, setResult] = useState<ActivityResult | "">("");

  const query = useInfiniteQuery(
    trpc.auditEvents.list.infiniteQueryOptions(
      {
        scope,
        limit: 25,
        action: action || undefined,
        actorUserId: scope === "org" && actorUserId ? actorUserId : undefined,
        projectId: projectId || undefined,
        result: result || undefined,
        excludePassive: includePassive ? false : undefined,
        excludeDenied: result === "denied" ? false : undefined,
      },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );

  const rows = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );
  const items = useMemo(
    () =>
      rows.map((row) =>
        auditRowToActivityItem(row, {
          projectHref: (slug, orgSlug) =>
            orgSlug || org ? routes.project(orgSlug || org, slug) : null,
        }),
      ),
    [rows, org],
  );

  const [seenActions, setSeenActions] = useState<ActivityFilterOption[]>([]);
  const [seenActors, setSeenActors] = useState<ActivityFilterOption[]>([]);
  const [seenProjects, setSeenProjects] = useState<ActivityFilterOption[]>([]);

  const actionOptions = useMemo(
    () => auditActionFilterOptions(rows, seenActions, action),
    [rows, seenActions, action],
  );
  const actorOptions = useMemo(
    () =>
      scope === "org"
        ? auditActorFilterOptions(rows, seenActors, actorUserId)
        : [],
    [rows, seenActors, actorUserId, scope],
  );
  const projectOptions = useMemo(
    () => auditProjectFilterOptions(rows, seenProjects, projectId),
    [rows, seenProjects, projectId],
  );

  if (query.error) {
    return (
      <ErrorState
        title="Could not load activity"
        description={query.error.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  const filtersActive = Boolean(
    action || result || actorUserId || projectId || includePassive,
  );

  return (
    <ActivityTimeline
      filtersInHeader
      items={items}
      loading={query.isLoading}
      actionOptions={actionOptions}
      action={action}
      onActionChange={(v) => {
        setSeenActions(actionOptions);
        setAction(v);
      }}
      actorOptions={scope === "org" ? actorOptions : undefined}
      actor={actorUserId}
      onActorChange={
        scope === "org"
          ? (v) => {
              setSeenActors(actorOptions);
              setActorUserId(v);
            }
          : undefined
      }
      projectOptions={projectOptions}
      project={projectId}
      onProjectChange={(v) => {
        setSeenProjects(projectOptions);
        setProjectId(v);
      }}
      includePassive={includePassive}
      onIncludePassiveChange={setIncludePassive}
      result={result}
      onResultChange={setResult}
      hasMore={query.hasNextPage}
      loadingMore={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      LinkComponent={({ href, className, children }) => (
        <Link href={href as never} className={className}>
          {children}
        </Link>
      )}
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {scope === "org" && !unassignedLoading && unassigned
                ? CONTACT_MANAGER_TITLE
                : "No activity yet"}
            </EmptyTitle>
            <EmptyDescription>
              {scope === "org" && !unassignedLoading && unassigned
                ? CONTACT_MANAGER_DESCRIPTION
                : filtersActive
                  ? includePassive
                    ? "No events match these filters."
                    : "No events match these filters. Try enabling views & reads."
                  : "Changes in this organization will appear here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}
