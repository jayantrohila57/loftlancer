"use client";
import { AccordionSection } from "@features/patterns/core/client/patterns.accordion-section";
import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";
import type { TeamDto } from "../../../utils/types/utils.team.dto";
import { useTeamGet } from "../hooks/client.use-teams-get.hook";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";
import { TeamOverviewContent } from "./client.overview.content";
import { TeamsResponseMessage } from "./client.response.boundary";
export function TeamOverviewBoundary({
  orgId,
  teamId,
  response,
}: {
  orgId: string;
  teamId: string;
  response: ServiceResponse<TeamDto>;
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
  return (
    <TeamOverviewContent team={result.data}>
      <AccordionSection
        title="How team access works"
        description="Teams connect organization membership to project access."
      >
        <p className="text-muted-foreground max-w-3xl text-sm">
          Add organization members in Members, then choose which projects this
          team can access in Projects. Project Access shows what each person can
          do.
        </p>
      </AccordionSection>
    </TeamOverviewContent>
  );
}
