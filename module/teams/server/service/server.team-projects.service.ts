import { requireAction } from "@features/authorization/core/server/authorization.require-action";
import { db } from "@loftlancer/drizzle";
import { projectTeam } from "@loftlancer/drizzle/schema/project-access";
import { project } from "@loftlancer/drizzle/schema/projects";
import { team } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import { and, eq, isNull } from "drizzle-orm";
import { teamOutcome } from "./server.team-outcome.service";
export function teamProjectsService(
  ctx: RunActionContext,
  input: { teamId: string },
) {
  return teamOutcome(async () => {
    const organizationId = ctx.orgId;
    if (!organizationId) throw new Error("organization_not_found");

    const rows = await db
      .select({
        id: project.id,
        name: project.name,
        slug: project.slug,
      })
      .from(projectTeam)
      .innerJoin(project, eq(projectTeam.projectId, project.id))
      .innerJoin(team, eq(projectTeam.teamId, team.id))
      .where(
        and(
          eq(projectTeam.organizationId, organizationId),
          eq(projectTeam.teamId, input.teamId),
          eq(team.organizationId, organizationId),
          isNull(team.deletedAt),
          isNull(projectTeam.deletedAt),
          isNull(project.deletedAt),
        ),
      )
      .orderBy(project.name);

    if (rows.length === 0) {
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
    }

    const visibleProjects = await Promise.all(
      rows.map(async (row) => {
        try {
          await requireAction("project.read", {
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
    return visibleProjects.filter((row) => row !== null);
  }, "Projects loaded");
}
