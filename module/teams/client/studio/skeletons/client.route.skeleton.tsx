import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { TeamsListSkeleton } from "./client.team-list.skeleton";
import { TeamOverviewSkeleton } from "./client.team-overview.skeleton";
export function TeamsRouteLoading() {
  return <DelayedPageLoading fallback={<TeamOverviewSkeleton />} />;
}

export function TeamsListRouteLoading() {
  return <DelayedPageLoading fallback={<TeamsListSkeleton />} />;
}
