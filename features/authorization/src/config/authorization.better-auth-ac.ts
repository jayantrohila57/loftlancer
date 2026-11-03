import { createAccessControl } from "better-auth/plugins/access";

/**
 * Better Auth organization plugin statements (Phase 1).
 * Platform ADMIN is reserved — not configured here.
 */
export const orgStatements = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
} as const;

export const orgAc = createAccessControl(orgStatements);

/** Full org control (OWNER). */
export const ownerRole = orgAc.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});

/**
 * MANAGER: invite members, manage teams, no org delete / member role changes.
 * Maps to `member.role = 'manager'` (legacy `admin` migrated in SQL).
 */
export const managerRole = orgAc.newRole({
  organization: ["update"],
  member: ["create"],
  invitation: ["create"],
  team: ["create", "update", "delete"],
  ac: ["read"],
});

/** Org member without org-admin capabilities; project access via teams/grants. */
export const memberRole = orgAc.newRole({
  ac: ["read"],
});

export const orgBetterAuthRoles = {
  owner: ownerRole,
  manager: managerRole,
  member: memberRole,
} as const;
