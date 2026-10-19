import {
  getOwnerMutationBlockReason,
  isOwnerRole,
} from "@loftlancer/auth/member-removal-policy";
import {
  activeInvitationWhere,
  activeMemberWhere,
  db,
  softDeleteSet,
} from "@loftlancer/db";
import { assertOrganizationCanBeDeleted } from "@loftlancer/db/org-delete-policy";
import { user } from "@loftlancer/db/schema/auth";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/db/schema/organization";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { isSoftDeletesEnabled } from "@loftlancer/env/soft-deletes";
import { and, eq, isNull, sql } from "drizzle-orm";
import { requireAction } from "../actions/require-action";
import { transferOrganizationOwnership } from "../organization-ownership";
import { resolveOrganizationIdForUser } from "./resolve-organization";

function slugifyOrganizationName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "organization";
}

async function ensureUniqueOrgSlug(base: string): Promise<string> {
  let slug = base;
  let suffix = 0;
  for (;;) {
    const [existing] = await db
      .select({ id: organization.id })
      .from(organization)
      .where(and(eq(organization.slug, slug), isNull(organization.deletedAt)))
      .limit(1);
    if (!existing) {
      return slug;
    }
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function mcpOrganizationCreate(
  userId: string,
  input: { name: string; slug?: string },
) {
  await requireAction("organization.create", { userId });
  const name = input.name.trim();
  if (!name) {
    throw new Error("invalid_input: name");
  }
  const baseSlug = input.slug?.trim() || slugifyOrganizationName(name);
  const slug = await ensureUniqueOrgSlug(baseSlug);
  const orgId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  await db.insert(organization).values({
    id: orgId,
    name,
    slug,
    metadata: JSON.stringify({ type: "team" }),
  });
  await db.insert(member).values({
    id: memberId,
    organizationId: orgId,
    userId,
    role: "owner",
  });

  return { id: orgId, name, slug, role: "owner" };
}

export async function mcpOrganizationUpdate(
  userId: string,
  organizationId: string,
  input: { name?: string; logo?: string | null },
  action:
    | "organization.update"
    | "organization.settings.update" = "organization.update",
) {
  await requireAction(action, { userId, organizationId });
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name.trim();
  if (input.logo !== undefined) update.logo = input.logo;

  const [row] = await db
    .update(organization)
    .set(update)
    .where(
      and(eq(organization.id, organizationId), isNull(organization.deletedAt)),
    )
    .returning({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    });

  if (!row) {
    throw new Error("organization_not_found");
  }
  return row;
}

export async function mcpOrganizationDelete(
  userId: string,
  organizationId: string,
) {
  await requireAction("organization.delete", { userId, organizationId });
  const [org] = await db
    .select()
    .from(organization)
    .where(
      and(eq(organization.id, organizationId), isNull(organization.deletedAt)),
    )
    .limit(1);
  if (!org) {
    throw new Error("organization_not_found");
  }
  await assertOrganizationCanBeDeleted(org, userId);

  if (isSoftDeletesEnabled()) {
    await db
      .update(organization)
      .set(softDeleteSet(userId))
      .where(eq(organization.id, organizationId));
  } else {
    await db.delete(organization).where(eq(organization.id, organizationId));
  }
  return { success: true, organizationId };
}

export async function mcpOrganizationRestore(
  userId: string,
  organizationId: string,
) {
  await requireAction("organization.restore", { userId, organizationId });
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const [row] = await db
    .update(organization)
    .set({ deletedAt: null, deletedBy: null })
    .where(eq(organization.id, organizationId))
    .returning({ id: organization.id, slug: organization.slug });
  if (!row) {
    throw new Error("organization_not_found");
  }
  return row;
}

export async function mcpOrganizationView(
  userId: string,
  organizationId: string,
) {
  await requireAction("organization.view", { userId, organizationId });
  const [row] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      role: member.role,
    })
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .where(
      activeMemberWhere(
        and(
          eq(organization.id, organizationId),
          eq(member.userId, userId),
          isNull(organization.deletedAt),
        ),
      ),
    )
    .limit(1);
  if (!row) {
    throw new Error("organization_not_found");
  }
  return row;
}

export async function mcpOrganizationTransferOwnership(
  userId: string,
  organizationId: string,
  targetUserId: string,
) {
  await requireAction("organization.transfer_ownership", {
    userId,
    organizationId,
    targetUserId,
  });
  return transferOrganizationOwnership({
    actorUserId: userId,
    organizationId,
    targetUserId,
  });
}

export async function mcpMembersList(userId: string, organizationId: string) {
  await requireAction("member.list", { userId, organizationId });
  const rows = await db
    .select({
      id: member.id,
      userId: member.userId,
      role: member.role,
      name: user.name,
      email: user.email,
      createdAt: member.createdAt,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(
      activeMemberWhere(
        and(
          eq(member.organizationId, organizationId),
          isNull(member.deletedAt),
        ),
      ),
    )
    .orderBy(member.createdAt);
  return { items: rows };
}

export async function mcpMemberInvite(
  userId: string,
  organizationId: string,
  input: { email: string; role?: string; teamId?: string },
) {
  await requireAction("member.invite", { userId, organizationId });
  const email = input.email.trim().toLowerCase();
  const inviteId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(invitation).values({
    id: inviteId,
    organizationId,
    email,
    role: input.role ?? "member",
    status: "pending",
    expiresAt,
    inviterId: userId,
    teamId: input.teamId ?? null,
  });
  return {
    id: inviteId,
    email,
    role: input.role ?? "member",
    status: "pending",
  };
}

export async function mcpMemberRemove(
  userId: string,
  organizationId: string,
  targetUserId: string,
) {
  await requireAction("member.remove", {
    userId,
    organizationId,
    targetUserId,
  });
  await db.transaction(async (tx) => {
    await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    const rows = await tx
      .select({ id: member.id, userId: member.userId, role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            isNull(member.deletedAt),
          ),
        ),
      )
      .for("update");
    const target = rows.find((row) => row.userId === targetUserId);
    if (!target) throw new Error("member_not_found");
    const ownerCount = rows.filter((row) => isOwnerRole(row.role)).length;
    if (
      getOwnerMutationBlockReason({
        targetRole: target.role,
        activeOwnerCount: ownerCount,
        removing: true,
      })
    ) {
      throw new Error(
        "Transfer ownership first; the organization must have an owner.",
      );
    }
    if (isSoftDeletesEnabled()) {
      await tx
        .update(member)
        .set(softDeleteSet(userId))
        .where(eq(member.id, target.id));
    } else {
      await tx.delete(member).where(eq(member.id, target.id));
    }
  });
  return { success: true, userId: targetUserId };
}

export async function mcpMemberUpdateRole(
  userId: string,
  organizationId: string,
  targetUserId: string,
  role: string,
) {
  await requireAction("member.role.update", {
    userId,
    organizationId,
    targetUserId,
  });
  return db.transaction(async (tx) => {
    await tx
      .select({ id: organization.id })
      .from(organization)
      .where(
        and(
          eq(organization.id, organizationId),
          isNull(organization.deletedAt),
        ),
      )
      .for("update");
    const rows = await tx
      .select({ id: member.id, userId: member.userId, role: member.role })
      .from(member)
      .where(
        activeMemberWhere(
          and(
            eq(member.organizationId, organizationId),
            isNull(member.deletedAt),
          ),
        ),
      )
      .for("update");
    const target = rows.find((row) => row.userId === targetUserId);
    if (!target) throw new Error("member_not_found");
    const ownerCount = rows.filter((row) => isOwnerRole(row.role)).length;
    if (
      getOwnerMutationBlockReason({
        targetRole: target.role,
        activeOwnerCount: ownerCount,
        nextRole: role,
      })
    ) {
      throw new Error(
        "Transfer ownership first; the organization must have an owner.",
      );
    }
    const [updated] = await tx
      .update(member)
      .set({ role })
      .where(eq(member.id, target.id))
      .returning({ id: member.id, userId: member.userId, role: member.role });
    return updated;
  });
}

export async function mcpInvitationsList(
  userId: string,
  organizationId: string,
) {
  await requireAction("member.list", { userId, organizationId });
  const rows = await db
    .select()
    .from(invitation)
    .where(activeInvitationWhere(eq(invitation.organizationId, organizationId)))
    .orderBy(invitation.createdAt);
  return { items: rows };
}

export async function mcpInvitationCancel(
  userId: string,
  organizationId: string,
  invitationId: string,
) {
  await requireAction("invitation.cancel", { userId, organizationId });
  const [row] = await db
    .update(invitation)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.organizationId, organizationId),
      ),
    )
    .returning({ id: invitation.id, status: invitation.status });
  if (!row) {
    throw new Error("invitation_not_found");
  }
  return row;
}

export async function mcpInvitationAccept(
  userId: string,
  invitationId: string,
) {
  const [invite] = await db
    .select()
    .from(invitation)
    .where(
      activeInvitationWhere(
        and(eq(invitation.id, invitationId), eq(invitation.status, "pending")),
      ),
    )
    .limit(1);
  if (!invite) {
    throw new Error("invitation_not_found");
  }

  const [actor] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (
    !actor?.email ||
    actor.email.toLowerCase() !== invite.email.toLowerCase()
  ) {
    throw new Error("invitation_email_mismatch");
  }

  await requireAction("invitation.accept", {
    userId,
    organizationId: invite.organizationId,
  });

  const memberId = crypto.randomUUID();
  await db.insert(member).values({
    id: memberId,
    organizationId: invite.organizationId,
    userId,
    role: invite.role,
  });
  await db
    .update(invitation)
    .set({ status: "accepted" })
    .where(eq(invitation.id, invitationId));

  return {
    memberId,
    organizationId: invite.organizationId,
    invitationId,
    status: "accepted",
  };
}

export async function mcpInvitationReject(
  userId: string,
  invitationId: string,
) {
  const [invite] = await db
    .select()
    .from(invitation)
    .where(eq(invitation.id, invitationId))
    .limit(1);
  if (!invite) {
    throw new Error("invitation_not_found");
  }

  const [actor] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (
    !actor?.email ||
    actor.email.toLowerCase() !== invite.email.toLowerCase()
  ) {
    throw new Error("invitation_email_mismatch");
  }

  await requireAction("invitation.reject", {
    userId,
    organizationId: invite.organizationId,
  });

  await db
    .update(invitation)
    .set({ status: "rejected" })
    .where(eq(invitation.id, invitationId));
  return { invitationId, status: "rejected" };
}

export async function mcpTeamsList(userId: string, organizationId: string) {
  await requireAction("member.list", { userId, organizationId });
  const rows = await db
    .select()
    .from(team)
    .where(and(eq(team.organizationId, organizationId), isNull(team.deletedAt)))
    .orderBy(team.name);
  return { items: rows };
}

export async function teamMembersList(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  await requireAction("member.list", { userId, organizationId });
  const [row] = await db
    .select({ id: team.id })
    .from(team)
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .limit(1);
  if (!row) {
    throw new Error("Team not found");
  }
  const rows = await db
    .select({
      id: teamMember.id,
      userId: teamMember.userId,
      teamId: teamMember.teamId,
    })
    .from(teamMember)
    .where(eq(teamMember.teamId, teamId));
  return { items: rows };
}

export async function mcpTeamCreate(
  userId: string,
  organizationId: string,
  name: string,
) {
  await requireAction("team.create", { userId, organizationId });
  const teamId = crypto.randomUUID();
  await db.insert(team).values({
    id: teamId,
    name: name.trim(),
    organizationId,
    memberCount: 1,
  });
  await db.insert(teamMember).values({
    id: crypto.randomUUID(),
    teamId,
    userId,
  });
  return { id: teamId, name: name.trim(), organizationId };
}

export async function mcpTeamUpdate(
  userId: string,
  organizationId: string,
  teamId: string,
  name: string,
) {
  await requireAction("team.update", { userId, organizationId });
  const [row] = await db
    .update(team)
    .set({ name: name.trim(), updatedAt: new Date() })
    .where(
      and(
        eq(team.id, teamId),
        eq(team.organizationId, organizationId),
        isNull(team.deletedAt),
      ),
    )
    .returning({ id: team.id, name: team.name });
  if (!row) {
    throw new Error("team_not_found");
  }
  return row;
}

export async function mcpTeamDelete(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  await requireAction("team.delete", { userId, organizationId });
  if (isSoftDeletesEnabled()) {
    await db
      .update(team)
      .set(softDeleteSet(userId))
      .where(and(eq(team.id, teamId), eq(team.organizationId, organizationId)));
  } else {
    await db
      .delete(team)
      .where(and(eq(team.id, teamId), eq(team.organizationId, organizationId)));
  }
  return { success: true, teamId };
}

export async function mcpTeamRestore(
  userId: string,
  organizationId: string,
  teamId: string,
) {
  await requireAction("team.restore", { userId, organizationId });
  if (!isSoftDeletesEnabled()) {
    throw new Error("soft_deletes_disabled");
  }
  const [row] = await db
    .update(team)
    .set({ deletedAt: null, deletedBy: null })
    .where(and(eq(team.id, teamId), eq(team.organizationId, organizationId)))
    .returning({ id: team.id, name: team.name });
  if (!row) {
    throw new Error("team_not_found");
  }
  return row;
}

export async function mcpTeamAddMember(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  await requireAction("team.member.add", { userId, organizationId });
  await db.insert(teamMember).values({
    id: crypto.randomUUID(),
    teamId,
    userId: targetUserId,
  });
  await db
    .update(team)
    .set({ memberCount: sql`${team.memberCount} + 1` })
    .where(eq(team.id, teamId));
  return { teamId, userId: targetUserId };
}

export async function mcpTeamRemoveMember(
  userId: string,
  organizationId: string,
  teamId: string,
  targetUserId: string,
) {
  await requireAction("team.member.remove", { userId, organizationId });
  await db
    .delete(teamMember)
    .where(
      and(eq(teamMember.teamId, teamId), eq(teamMember.userId, targetUserId)),
    );
  await db
    .update(team)
    .set({ memberCount: sql`GREATEST(${team.memberCount} - 1, 0)` })
    .where(eq(team.id, teamId));
  return { teamId, userId: targetUserId };
}

export async function resolveOrgFromInput(
  userId: string,
  input: { organizationId?: string; organizationSlug?: string },
): Promise<string | null> {
  if (!input.organizationId && !input.organizationSlug) {
    return null;
  }
  return resolveOrganizationIdForUser(userId, input);
}
