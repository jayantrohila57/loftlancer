import {
  type ActionName,
  actionNames,
  getActionDefinition,
} from "@loftlancer/actions";

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
  // Built-in Owner, Manager, and Member roles are the only organization roles
  // supported by the product. Ignore legacy custom-role records so they can
  // never grant effective authorization.
  void userId;
  void organizationId;
  return [];
}
