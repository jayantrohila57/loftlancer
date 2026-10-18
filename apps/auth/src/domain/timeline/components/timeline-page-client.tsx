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
  auditProjectFilterOptions,
  auditRowToActivityItem,
} from "@loftlancer/ui/patterns/activity-timeline";
import { routes } from "@loftlancer/ui/studio-routes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { studioDashboardPath } from "@/lib/studio-url";
import { trpc } from "@/utils/trpc";

type TimelinePageClientProps = {
  scope: "org" | "self";
};

export function TimelinePageClient({ scope }: TimelinePageClientProps) {
  const [action, setAction] = useState("");
  const [projectId, setProjectId] = useState("");
  const [includePassive, setIncludePassive] = useState(false);
  const [result, setResult] = useState<ActivityResult | "">("");

  const query = useInfiniteQuery(
    trpc.auditEvents.list.infiniteQueryOptions(
      {
        scope,
        limit: 25,
        action: action || undefined,
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
            orgSlug ? studioDashboardPath(routes.project(orgSlug, slug)) : null,
        }),
      ),
    [rows],
  );

  const [seenActions, setSeenActions] = useState<ActivityFilterOption[]>([]);
  const [seenProjects, setSeenProjects] = useState<ActivityFilterOption[]>([]);

  const actionOptions = useMemo(
    () => auditActionFilterOptions(rows, seenActions, action),
    [rows, seenActions, action],
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
    action || result || projectId || includePassive,
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
        <a href={href} className={className}>
          {children}
        </a>
      )}
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No activity yet</EmptyTitle>
            <EmptyDescription>
              {filtersActive
                ? includePassive
                  ? "No events match these filters."
                  : "No events match these filters. Try enabling views & reads."
                : "Changes you make in the app will appear here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}
