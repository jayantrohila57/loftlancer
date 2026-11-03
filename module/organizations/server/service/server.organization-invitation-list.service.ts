import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { invitation } from "@loftlancer/drizzle/schema/organization";
import { projectTeam } from "@loftlancer/drizzle/schema/project-access";
import { project } from "@loftlancer/drizzle/schema/projects";
import { team } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import {
  and,
  desc,
  eq,
  gt,
  ilike,
  isNull,
  lte,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import type {
  OrganizationInvitationListInput,
  OrganizationInvitationListOutput,
} from "../../utils/validation/utils.organization-invitations.validation";

export async function organizationInvitationListService(
  _ctx: RunActionContext,
  input: OrganizationInvitationListInput,
): Promise<ServiceOutcome<OrganizationInvitationListOutput>> {
  if (input.teamId) {
    const [teamRow] = await db
      .select({ id: team.id })
      .from(team)
      .where(
        and(
          eq(team.id, input.teamId),
          eq(team.organizationId, input.organizationId),
          isNull(team.deletedAt),
        ),
      )
      .limit(1);
    if (!teamRow) return { kind: "failed", message: "Team not found" };
  }
  const now = new Date();
  const org = and(
    eq(invitation.organizationId, input.organizationId),
    input.teamId
      ? eq(invitation.teamId, input.teamId)
      : and(isNull(invitation.teamId), isNull(invitation.projectId)),
  );
  const searchableOrg = and(
    org,
    input.search
      ? or(
          ilike(invitation.email, `%${input.search}%`),
          ilike(user.name, `%${input.search}%`),
          ilike(team.name, `%${input.search}%`),
        )
      : undefined,
  );
  const byStatus: Record<string, SQL | undefined> = {
    all: searchableOrg,
    pending: and(
      searchableOrg,
      eq(invitation.status, "pending"),
      gt(invitation.expiresAt, now),
    ),
    expired: and(
      searchableOrg,
      eq(invitation.status, "pending"),
      lte(invitation.expiresAt, now),
    ),
    accepted: and(searchableOrg, eq(invitation.status, "accepted")),
    rejected: and(searchableOrg, eq(invitation.status, "rejected")),
    canceled: and(searchableOrg, eq(invitation.status, "canceled")),
  };
  const where = byStatus[input.status];
  const [rows, counts] = await Promise.all([
    db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        teamName: team.name,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        inviterName: user.name,
      })
      .from(invitation)
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .leftJoin(team, eq(invitation.teamId, team.id))
      .where(where)
      .orderBy(desc(invitation.expiresAt))
      .limit(input.limit)
      .offset(input.offset),
    db
      .select({
        all: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where ${invitation.status} = 'pending' and ${invitation.expiresAt} > ${now})::int`,
        expired: sql<number>`count(*) filter (where ${invitation.status} = 'pending' and ${invitation.expiresAt} <= ${now})::int`,
        accepted: sql<number>`count(*) filter (where ${invitation.status} = 'accepted')::int`,
        rejected: sql<number>`count(*) filter (where ${invitation.status} = 'rejected')::int`,
        canceled: sql<number>`count(*) filter (where ${invitation.status} = 'canceled')::int`,
      })
      .from(invitation)
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .leftJoin(team, eq(invitation.teamId, team.id))
      .where(searchableOrg),
  ]);
  const countsByStatus = counts[0] ?? {
    all: 0,
    pending: 0,
    expired: 0,
    accepted: 0,
    rejected: 0,
    canceled: 0,
  };
  const linkedProjects = input.teamId
    ? await db
        .select({ name: project.name })
        .from(projectTeam)
        .innerJoin(project, eq(projectTeam.projectId, project.id))
        .where(
          and(
            eq(projectTeam.teamId, input.teamId),
            eq(projectTeam.organizationId, input.organizationId),
            isNull(projectTeam.deletedAt),
            isNull(project.deletedAt),
          ),
        )
        .orderBy(project.name)
    : [];
  return {
    kind: "success",
    data: {
      rows: rows.map((row) => ({
        ...row,
        invitedTeamRole: input.teamId ? ("member" as const) : null,
        linkedProjects: linkedProjects.map(({ name }) => name),
      })),
      counts: countsByStatus,
      total: countsByStatus[input.status] ?? 0,
    },
    message: "Invitations loaded.",
  };
}
