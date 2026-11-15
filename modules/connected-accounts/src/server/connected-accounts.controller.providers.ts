import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { providersRoutes } from "../utils/config/connected-accounts.config.providers"
import { listProvidersOutputSchema } from "../utils/validation/connected-accounts.providers.list.schema"
import { providersService } from "./services/connected-accounts.service.router"

export const providersController = {
  list: protectedProcedure
    .route(providersRoutes.list)
    .output(listProvidersOutputSchema)
    .handler(() => listProvidersOutputSchema.parse(providersService.list())),
}
