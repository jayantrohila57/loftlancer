import { storageOrgProcedure } from "@modules/storage/server"

import { assertBillingOrgOwner } from "./billing.owner-gate"

export const billingOrgOwnerProcedure = storageOrgProcedure.use(
  async ({ context, next }) => {
    assertBillingOrgOwner({ isOrgOwner: context.isOrgOwner })
    return next({ context })
  }
)
