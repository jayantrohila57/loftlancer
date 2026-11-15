import { providersController } from "./connected-accounts.controller.providers"
import { signInMethodsController } from "./connected-accounts.controller.sign-in-methods"

export const connectedAccountsRouter = {
  providers: providersController,
  signInMethods: signInMethodsController,
}
