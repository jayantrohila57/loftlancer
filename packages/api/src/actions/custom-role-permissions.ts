import {
  type ActionName,
  actionNames,
  getActionDefinition,
} from "@loftlancer/actions";
import { db } from "@loftlancer/db";
import {
  member,
  memberOrganizationRole,
  organizationRolePermission,
} from "@loftlancer/db/schema/organization";
import { and, eq, isNull } from "drizzle-orm";

const DELEGABLE_ORGANIZATION_ACTIONS = new Set<ActionName>(
  actionNames.filter((action) => {
    const definition = getActionDefinition(action);
    return (
      definition.scope === "organization" &&
      Boolean(definition.orgRoles?.length) &&
      definition.orgRoles?.some((role) => role !== "owner")
    );
  }),
);

export function isDelegableOrganizationAction(
  action: string,
): action is ActionName {
  return DELEGABLE_ORGANIZATION_ACTIONS.has(action as ActionName);
}

/** Fetch one member's effective custom organization action set, tenant-scoped. */
export async function loadCustomOrganizationActions(
  userId: string,
  organizationId: string,
): Promise<ActionName[]> {
  const rows = await db
    .select({ actionName: organizationRolePermission.actionName })
    .from(memberOrganizationRole)
    .innerJoin(
      member,
      and(
        eq(member.id, memberOrganizationRole.memberId),
        eq(member.organizationId, memberOrganizationRole.organizationId),
      ),
    )
    .innerJoin(
      organizationRolePermission,
      and(
        eq(organizationRolePermission.roleId, memberOrganizationRole.roleId),
        eq(
          organizationRolePermission.organizationId,
          memberOrganizationRole.organizationId,
        ),
      ),
    )
    .where(
      and(
        eq(memberOrganizationRole.organizationId, organizationId),
        eq(member.userId, userId),
        isNull(member.deletedAt),
        isNull(member.suspendedAt),
      ),
    );
  return rows
    .map((row) => row.actionName)
    .filter(isDelegableOrganizationAction);
}
