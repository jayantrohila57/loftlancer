import { createSuccess } from "@packages/orpc"
import { adminUsersRoutes } from "../utils/config/admin.routes.users"
import {
  adminUserActionOutputSchema,
  banUserInputSchema,
  unbanUserInputSchema,
} from "../utils/validation/admin.users.ban.schema"
import {
  listUsersInputSchema,
  listUsersOutputSchema,
} from "../utils/validation/admin.users.list.schema"
import { adminService } from "./services/admin.service.router"
import { adminProcedure } from "./shared/admin.procedure"

export const adminUsersController = {
  list: adminProcedure
    .route(adminUsersRoutes.list)
    .input(listUsersInputSchema)
    .output(listUsersOutputSchema)
    .handler(async ({ context, input }) =>
      listUsersOutputSchema.parse(
        createSuccess(
          await adminService.users.list({
            auth: context.auth,
            headers: context.headers,
            query: input,
          }),
          "Users loaded."
        )
      )
    ),
  ban: adminProcedure
    .route(adminUsersRoutes.ban)
    .input(banUserInputSchema)
    .output(adminUserActionOutputSchema)
    .handler(async ({ context, input }) =>
      adminUserActionOutputSchema.parse(
        createSuccess(
          await adminService.users.ban({
            auth: context.auth,
            body: input,
            headers: context.headers,
          }),
          "User banned."
        )
      )
    ),
  unban: adminProcedure
    .route(adminUsersRoutes.unban)
    .input(unbanUserInputSchema)
    .output(adminUserActionOutputSchema)
    .handler(async ({ context, input }) =>
      adminUserActionOutputSchema.parse(
        createSuccess(
          await adminService.users.unban({
            auth: context.auth,
            body: input,
            headers: context.headers,
          }),
          "User unbanned."
        )
      )
    ),
}
