"use client";

import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";
import dynamic from "next/dynamic";
import type { TeamDto } from "../../../utils/types/utils.team.dto";
import { useTeamsList } from "../hooks/client.use-teams-list.hook";
import { TeamsListTableSkeleton } from "../skeletons/client.team-list.skeleton";
import { TeamsResponseMessage } from "./client.response.boundary";

const TeamsListContent = dynamic(
  () => import("./client.list.content").then((m) => m.TeamsListContent),
  { loading: () => <TeamsListTableSkeleton /> },
);

export function TeamsListBoundary({
  orgId,
  slug,
  organizationName,
  response,
}: {
  orgId: string;
  slug: string;
  organizationName: string;
  response: ServiceResponse<TeamDto>;
}) {
  const query = useTeamsList(orgId, response);
  if (query.isPending) return <TeamsListTableSkeleton />;
  if (query.isError)
    return (
      <TeamsResponseMessage
        message="Please try loading teams again."
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
  return (
    <TeamsListContent
      organizationName={organizationName}
      teams={Array.isArray(result.data) ? result.data : []}
      slug={slug}
    />
  );
}
