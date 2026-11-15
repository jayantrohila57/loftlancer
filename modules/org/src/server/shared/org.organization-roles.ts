import {
  defaultAc,
  defaultRoles,
} from "better-auth/plugins/organization/access"

/** v1: manager/admin match member — no invite, remove, or org admin in BA. */
const orgMemberLikeAc = defaultAc.newRole({
  ac: ["read"],
  invitation: [],
  member: [],
  organization: [],
  team: [],
})

export const orgOrganizationAccessControl = defaultAc

export const orgOrganizationPluginRoles = {
  owner: defaultRoles.owner,
  member: defaultRoles.member,
  manager: orgMemberLikeAc,
  admin: orgMemberLikeAc,
}
