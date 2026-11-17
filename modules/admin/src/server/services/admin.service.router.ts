import { banUser } from "./admin.service.users.ban"
import { listUsers } from "./admin.service.users.list"
import { unbanUser } from "./admin.service.users.unban"

export const adminService = {
  users: { ban: banUser, list: listUsers, unban: unbanUser },
}
