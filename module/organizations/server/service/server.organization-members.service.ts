import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import {
  member,
  memberOrganizationRole,
  organizationRole,
  organizationRolePermission,
} from "@loftlancer/drizzle/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type {
  OrganizationMembersInput,
  OrganizationMembersOutput,
} from "../../utils/validation/utils.organization-members.validation";

export async function organizationMembersService(
  ctx: RunActionContext,
  _input: OrganizationMembersInput,
): Promise<ServiceOutcome<OrganizationMembersOutput>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization first." };
  const inviter = alias(user, "organization_member_inviter");
  const updater = alias(user, "organization_member_updater");
  const [rows, roleAssignments, rolePermissions] = await Promise.all([
    db
      .select({
        id: member.id,
        userId: member.userId,
        role: member.role,
        jobTitle: member.jobTitle,
        department: member.department,
        suspendedAt: member.suspendedAt,
        suspensionReason: member.suspensionReason,
        joinedAt: member.joinedAt,
        invitedBy: member.invitedBy,
        invitedByName: inviter.name,
        invitedByEmail: inviter.email,
        updatedAt: member.updatedAt,
        updatedByName: updater.name,
        name: user.name,
        email: user.email,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .leftJoin(inviter, eq(member.invitedBy, inviter.id))
      .leftJoin(updater, eq(member.updatedBy, updater.id))
      .where(
        and(eq(member.organizationId, ctx.orgId), isNull(member.deletedAt)),
      )
      .orderBy(member.createdAt),
    db
      .select({
        memberId: memberOrganizationRole.memberId,
        roleId: organizationRole.id,
        roleName: organizationRole.name,
        roleDescription: organizationRole.description,
      })
      .from(memberOrganizationRole)
      .innerJoin(
        organizationRole,
        and(
          eq(organizationRole.id, memberOrganizationRole.roleId),
          eq(
            organizationRole.organizationId,
            memberOrganizationRole.organizationId,
          ),
        ),
      )
      .where(eq(memberOrganizationRole.organizationId, ctx.orgId)),
    db
      .select({
        roleId: organizationRolePermission.roleId,
        actionName: organizationRolePermission.actionName,
      })
      .from(organizationRolePermission)
      .where(eq(organizationRolePermission.organizationId, ctx.orgId)),
  ]);

  return {
    kind: "success",
    data: {
      items: rows.map((row) => {
        const customRole = roleAssignments.find(
          (assignment) => assignment.memberId === row.id,
        );
        return {
          ...row,
          access: {
            builtInRole: row.role,
            customRole: customRole
              ? {
                  id: customRole.roleId,
                  name: customRole.roleName,
                  description: customRole.roleDescription,
                  actions: rolePermissions
                    .filter(
                      (permission) => permission.roleId === customRole.roleId,
                    )
                    .map((permission) => permission.actionName),
                }
              : null,
          },
        };
      }),
    },
    message: "Organization members loaded.",
  };
}
