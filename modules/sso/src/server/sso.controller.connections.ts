import { adminProcedure } from "@modules/admin/server"
import { createSuccess } from "@packages/orpc"

import { ssoConnectionsRoutes } from "../utils/config/sso.routes.connections"
import {
  listSsoConnectionsInputSchema,
  listSsoConnectionsOutputSchema,
} from "../utils/validation/sso.connections.list.schema"
import { ssoService } from "./services/sso.service.router"

export const ssoConnectionsController = {
  list: adminProcedure
    .route(ssoConnectionsRoutes.list)
    .input(listSsoConnectionsInputSchema)
    .output(listSsoConnectionsOutputSchema)
    .handler(async ({ context }) =>
      listSsoConnectionsOutputSchema.parse(
        createSuccess(
          await ssoService.connections.list({ auth: context.auth }),
          "SSO connections loaded."
        )
      )
    ),
}
