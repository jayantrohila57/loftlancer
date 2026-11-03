import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { invitation } from "@loftlancer/drizzle/schema/organization";
import { projectTeam } from "@loftlancer/drizzle/schema/project-access";
import { project } from "@loftlancer/drizzle/schema/projects";
import { team } from "@loftlancer/drizzle/schema/team";
import type { RunActionContext } from "@module/shared/server/run-action";
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
import type { TeamInvitationListInput } from "../../utils/validation/utils.team-extended.validation";
import { teamOutcome } from "./server.team-outcome.service";
export function teamInvitationListService(
  ctx: RunActionContext,
  input: TeamInvitationListInput,
) {
  return teamOutcome(async () => {
    const [found] = await db
      .select({ id: team.id })
      .from(team)
      .where(
        and(
          eq(team.id, input.teamId),
          eq(team.organizationId, ctx.orgId ?? ""),
          isNull(team.deletedAt),
        ),
      )
      .limit(1);
    if (!found) throw new Error("Team not found");
    const now = new Date();
    const scope = and(
      eq(invitation.organizationId, ctx.orgId ?? ""),
      eq(invitation.teamId, input.teamId),
      isNull(invitation.deletedAt),
      input.search
        ? or(
            ilike(invitation.email, `%${input.search}%`),
            ilike(user.name, `%${input.search}%`),
            ilike(team.name, `%${input.search}%`),
          )
        : undefined,
    );
    const statuses: Record<string, SQL | undefined> = {
      all: scope,
      pending: and(
        scope,
        eq(invitation.status, "pending"),
        gt(invitation.expiresAt, now),
      ),
      expired: and(
        scope,
        eq(invitation.status, "pending"),
        lte(invitation.expiresAt, now),
      ),
      accepted: and(scope, eq(invitation.status, "accepted")),
      rejected: and(scope, eq(invitation.status, "rejected")),
      canceled: and(scope, eq(invitation.status, "canceled")),
    };
    const [rows, counts, projects] = await Promise.all([
      db
        .select({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          createdAt: invitation.createdAt,
          updatedAt: invitation.updatedAt,
          lastSentAt: invitation.lastSentAt,
          acceptedAt: invitation.acceptedAt,
          rejectedAt: invitation.rejectedAt,
          revokedAt: invitation.revokedAt,
          expiresAt: invitation.expiresAt,
          inviterName: user.name,
        })
        .from(invitation)
        .leftJoin(user, eq(invitation.inviterId, user.id))
        .leftJoin(team, eq(invitation.teamId, team.id))
        .where(statuses[input.status])
        .orderBy(desc(invitation.expiresAt))
        .limit(input.limit)
        .offset(input.offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(invitation)
        .leftJoin(user, eq(invitation.inviterId, user.id))
        .leftJoin(team, eq(invitation.teamId, team.id))
        .where(statuses[input.status]),
      db
        .select({ name: project.name })
        .from(projectTeam)
        .innerJoin(project, eq(project.id, projectTeam.projectId))
        .where(
          and(
            eq(projectTeam.organizationId, ctx.orgId ?? ""),
            eq(projectTeam.teamId, input.teamId),
            isNull(projectTeam.deletedAt),
            isNull(project.deletedAt),
          ),
        )
        .orderBy(project.name),
    ]);
    return {
      rows: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        expiresAt: row.expiresAt.toISOString(),
        status:
          row.status === "pending" && row.expiresAt <= now
            ? "expired"
            : row.status,
        invitedTeamRole: "member" as const,
        linkedProjects: projects.map((p) => p.name),
      })),
      total: counts[0]?.total ?? 0,
    };
  }, "Team invitations loaded");
}
