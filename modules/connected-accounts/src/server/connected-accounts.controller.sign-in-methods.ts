import { protectedProcedure } from "@modules/security/server/shared/security.procedure"
import { getAuth } from "@packages/better-auth"
import { z } from "zod"
import { signInMethodsRoutes } from "../utils/config/connected-accounts.config.sign-in-methods"
import {
  linkedConnectedAccountSchema,
  serializeLinkedConnectedAccounts,
} from "../utils/serialization/connected-accounts.serialize.linked-accounts"
import { signInMethodInventoryOutputSchema } from "../utils/validation/connected-accounts.sign-in-methods.inventory.schema"
import { signInMethodsService } from "./services/connected-accounts.service.sign-in-methods.router"

export const signInMethodsController = {
  accounts: protectedProcedure
    .route(signInMethodsRoutes.accounts)
    .output(z.array(linkedConnectedAccountSchema))
    .handler(async ({ context }) => {
      const accounts = await getAuth().api.listUserAccounts({
        headers: context.headers,
      })
      return serializeLinkedConnectedAccounts(accounts)
    }),
  inventory: protectedProcedure
    .route(signInMethodsRoutes.inventory)
    .output(signInMethodInventoryOutputSchema)
    .handler(() =>
      signInMethodInventoryOutputSchema.parse(signInMethodsService.inventory())
    ),
}
