"use client";

import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";
import type { ReactNode } from "react";
import type { TeamDto } from "../../../utils/types/utils.team.dto";
import { useTeamGet } from "../hooks/client.use-teams-get.hook";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";
import { TeamsResponseMessage } from "./client.response.boundary";

export function TeamOverviewBoundary({
  orgId,
  teamId,
  response,
  children,
}: {
  orgId: string;
  teamId: string;
  response: ServiceResponse<TeamDto>;
  children: ReactNode;
}) {
  const query = useTeamGet(orgId, teamId, response);
  if (query.isPending) return <TeamOverviewSkeleton />;
  if (query.isError)
    return (
      <TeamsResponseMessage
        message="Please try loading team details again."
        error
        retry={() => void query.refetch()}
      />
    );
  const result = query.data;
  if (result.status !== "success")
    return (
      <TeamsResponseMessage
        message={result.message}
        error={result.status === "error"}
        retry={() => void query.refetch()}
      />
    );
  if (!result.data || Array.isArray(result.data))
    return <TeamsResponseMessage message="Team not found." />;
  return <section className="flex flex-col gap-4">{children}</section>;
}
