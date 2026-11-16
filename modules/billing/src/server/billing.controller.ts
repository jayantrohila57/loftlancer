import { billingRoutes } from "../utils/config/billing.config.routes"
import {
  billingCustomerProfileOutputSchema,
  billingDowngradeOutputSchema,
  billingInvoicesOutputSchema,
  billingListInvoicesInputSchema,
  billingPlansOutputSchema,
  billingSetupPaymentOutputSchema,
} from "../utils/validation/billing.catalog.schema"
import {
  billingCancelOutputSchema,
  billingOverviewOutputSchema,
  billingPortalOutputSchema,
  billingUpgradeOutputSchema,
} from "../utils/validation/billing.overview.schema"
import { billingBeginCancelService } from "./services/billing.service.cancel"
import { billingCustomerProfileService } from "./services/billing.service.customer-profile"
import { billingBeginDowngradeService } from "./services/billing.service.downgrade"
import { billingListInvoicesService } from "./services/billing.service.invoices"
import { billingOverviewService } from "./services/billing.service.overview"
import { billingListPlansService } from "./services/billing.service.plans"
import { billingOpenPortalService } from "./services/billing.service.portal"
import { billingSetupPaymentService } from "./services/billing.service.setup-payment"
import { billingBeginUpgradeService } from "./services/billing.service.upgrade"
import { billingOrgOwnerProcedure } from "./shared/billing.procedure"

export const billingController = {
  overview: billingOrgOwnerProcedure
    .route(billingRoutes.overview)
    .output(billingOverviewOutputSchema)
    .handler(async ({ context }) =>
      billingOverviewOutputSchema.parse(
        await billingOverviewService({
          organizationId: context.organizationId,
        })
      )
    ),
  beginUpgrade: billingOrgOwnerProcedure
    .route(billingRoutes.beginUpgrade)
    .output(billingUpgradeOutputSchema)
    .handler(async ({ context }) =>
      billingUpgradeOutputSchema.parse(
        await billingBeginUpgradeService({
          organizationId: context.organizationId,
          actorUserId: context.auth.user.id,
        })
      )
    ),
  beginDowngrade: billingOrgOwnerProcedure
    .route(billingRoutes.beginDowngrade)
    .output(billingDowngradeOutputSchema)
    .handler(async ({ context }) =>
      billingDowngradeOutputSchema.parse(
        await billingBeginDowngradeService({
          organizationId: context.organizationId,
          actorUserId: context.auth.user.id,
        })
      )
    ),
  openPortal: billingOrgOwnerProcedure
    .route(billingRoutes.openPortal)
    .output(billingPortalOutputSchema)
    .handler(async ({ context }) =>
      billingPortalOutputSchema.parse(
        await billingOpenPortalService({
          organizationId: context.organizationId,
        })
      )
    ),
  listPlans: billingOrgOwnerProcedure
    .route(billingRoutes.listPlans)
    .output(billingPlansOutputSchema)
    .handler(async ({ context }) =>
      billingPlansOutputSchema.parse(
        await billingListPlansService({
          organizationId: context.organizationId,
        })
      )
    ),
  listInvoices: billingOrgOwnerProcedure
    .route(billingRoutes.listInvoices)
    .input(billingListInvoicesInputSchema)
    .output(billingInvoicesOutputSchema)
    .handler(async ({ context, input }) =>
      billingInvoicesOutputSchema.parse(
        await billingListInvoicesService({
          organizationId: context.organizationId,
          cursor: input.cursor,
        })
      )
    ),
  listPaymentHistory: billingOrgOwnerProcedure
    .route(billingRoutes.listPaymentHistory)
    .input(billingListInvoicesInputSchema)
    .output(billingInvoicesOutputSchema)
    .handler(async ({ context, input }) =>
      billingInvoicesOutputSchema.parse(
        await billingListInvoicesService({
          organizationId: context.organizationId,
          paidOnly: true,
          cursor: input.cursor,
        })
      )
    ),
  customerProfile: billingOrgOwnerProcedure
    .route(billingRoutes.customerProfile)
    .output(billingCustomerProfileOutputSchema)
    .handler(async ({ context }) =>
      billingCustomerProfileOutputSchema.parse(
        await billingCustomerProfileService({
          organizationId: context.organizationId,
        })
      )
    ),
  setupPayment: billingOrgOwnerProcedure
    .route(billingRoutes.setupPayment)
    .output(billingSetupPaymentOutputSchema)
    .handler(async ({ context }) =>
      billingSetupPaymentOutputSchema.parse(
        await billingSetupPaymentService({
          organizationId: context.organizationId,
        })
      )
    ),
  beginCancel: billingOrgOwnerProcedure
    .route(billingRoutes.beginCancel)
    .output(billingCancelOutputSchema)
    .handler(async ({ context }) =>
      billingCancelOutputSchema.parse(
        await billingBeginCancelService({
          organizationId: context.organizationId,
        })
      )
    ),
}
