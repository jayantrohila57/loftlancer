import { db } from "@loftlancer/db";
import { projectTeam } from "@loftlancer/db/schema/project-access";
import { projectApp } from "@loftlancer/db/schema/project-app";
import { projectAppAccess } from "@loftlancer/db/schema/project-app-access";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  isProjectAppAccessAllowed,
  type ProjectAppAccessMode,
} from "./project-app-access-policy";

export async function hasProjectAppAccess(input: {
  userId: string;
  organizationId: string;
  projectId: string;
  appId: string;
  mode?: ProjectAppAccessMode | null;
  bypassRestriction?: boolean;
}): Promise<boolean> {
  const app = await loadProjectAppMode(input);
  const mode = input.mode ?? app?.accessMode;
  if (!mode || !app) return false;
  if (
    isProjectAppAccessAllowed({
      mode,
      bypassRestriction: input.bypassRestriction,
    })
  ) {
    return true;
  }

  const [direct] = await db
    .select({ id: projectAppAccess.id })
    .from(projectAppAccess)
    .where(
      and(
        eq(projectAppAccess.projectId, input.projectId),
        eq(projectAppAccess.projectAppId, app.id),
        eq(projectAppAccess.organizationId, input.organizationId),
        eq(projectAppAccess.userId, input.userId),
        isNull(projectAppAccess.deletedAt),
      ),
    )
    .limit(1);
  if (direct) return isProjectAppAccessAllowed({ mode, hasDirectGrant: true });

  const teamGrants = await db
    .select({ teamId: projectAppAccess.teamId })
    .from(projectAppAccess)
    .where(
      and(
        eq(projectAppAccess.projectId, input.projectId),
        eq(projectAppAccess.projectAppId, app.id),
        eq(projectAppAccess.organizationId, input.organizationId),
        isNull(projectAppAccess.deletedAt),
      ),
    );
  const teamIds = teamGrants.flatMap((grant) =>
    grant.teamId ? [grant.teamId] : [],
  );
  if (teamIds.length === 0) return false;

  const [membership] = await db
    .select({ id: teamMember.id })
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .innerJoin(
      projectTeam,
      and(
        eq(projectTeam.teamId, team.id),
        eq(projectTeam.projectId, input.projectId),
        eq(projectTeam.organizationId, input.organizationId),
        isNull(projectTeam.deletedAt),
      ),
    )
    .where(
      and(
        eq(teamMember.userId, input.userId),
        inArray(team.id, teamIds),
        eq(team.organizationId, input.organizationId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  return isProjectAppAccessAllowed({
    mode,
    hasLinkedTeamGrant: Boolean(membership),
  });
}

async function loadProjectAppMode(input: {
  organizationId: string;
  projectId: string;
  appId: string;
}): Promise<{
  id: string;
  accessMode: ProjectAppAccessMode;
} | null> {
  const [row] = await db
    .select({ id: projectApp.id, accessMode: projectApp.accessMode })
    .from(projectApp)
    .where(
      and(
        eq(projectApp.organizationId, input.organizationId),
        eq(projectApp.projectId, input.projectId),
        eq(projectApp.appId, input.appId),
        eq(projectApp.status, "active"),
      ),
    )
    .limit(1);
  return row
    ? {
        id: row.id,
        accessMode:
          row.accessMode === "restricted" ? "restricted" : "inherited",
      }
    : null;
}
