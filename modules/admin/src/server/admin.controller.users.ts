import { createSuccess } from "@packages/orpc"
import { adminUsersRoutes } from "../utils/config/admin.routes.users"
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
}
