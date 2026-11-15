import { defaultAc, userAc } from "better-auth/plugins/admin/access"

/** Platform admins: user management without impersonation until policy is approved. */
const platformAdminAc = defaultAc.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
})

export const betterAuthAdminRoles = {
  admin: platformAdminAc,
  user: userAc,
}
