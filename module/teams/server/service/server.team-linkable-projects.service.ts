import { requireAction } from "@loftlancer/api/actions/require-action";
import { db } from "@loftlancer/db";
import { project } from "@loftlancer/db/schema/projects";
import { team } from "@loftlancer/db/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import { teamOutcome } from "./server.team-outcome.service";
export function teamLinkableProjectsService(
  ctx: RunActionContext,
  input: { teamId: string },
) {
  return teamOutcome(async () => {
    const organizationId = ctx.orgId;
    if (!organizationId) throw new Error("organization_not_found");
    const [teamRow] = await db
      .select({ id: team.id })
      .from(team)
      .where(
        and(
          eq(team.id, input.teamId),
          eq(team.organizationId, organizationId),
          isNull(team.deletedAt),
        ),
      )
      .limit(1);
    if (!teamRow) {
      throw new Error("team_not_found");
    }
    const rows = await db
      .select({ id: project.id, name: project.name, slug: project.slug })
      .from(project)
      .where(
        and(
          eq(project.organizationId, organizationId),
          isNull(project.deletedAt),
        ),
      )
      .orderBy(project.name);
    const permitted = await Promise.all(
      rows.map(async (row) => {
        try {
          await requireAction("project.assign_team", {
            userId: ctx.userId,
            organizationId,
            projectId: row.id,
            audit: false,
          });
          return row;
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "FORBIDDEN"
          ) {
            return null;
          }
          throw error;
        }
      }),
    );
    return permitted.filter((row) => row !== null);
  }, "Projects loaded");
}
