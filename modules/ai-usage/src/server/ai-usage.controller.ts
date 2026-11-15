import { storageOrgProcedure } from "@modules/storage/server"

import { aiUsageRoutes } from "../utils/config/ai-usage.config.routes"
import {
  aiUsageHistoryInputSchema,
  aiUsageHistoryOutputSchema,
} from "../utils/validation/ai-usage.history.schema"
import {
  aiUsageLimitsAlertsOutputSchema,
  aiUsageLimitsAlertsUpdateInputSchema,
  aiUsageLimitsAlertsUpdateOutputSchema,
} from "../utils/validation/ai-usage.limits-alerts.schema"
import { aiUsageOverviewOutputSchema } from "../utils/validation/ai-usage.overview.schema"
import { aiUsageHistoryService } from "./services/ai-usage.service.history"
import {
  aiUsageLimitsAlertsGetService,
  aiUsageLimitsAlertsUpdateService,
} from "./services/ai-usage.service.limits-alerts"
import { aiUsageOverviewService } from "./services/ai-usage.service.overview"
import { aiUsageOrgOwnerProcedure } from "./shared/ai-usage.procedure.owner"

export const aiUsageController = {
  overview: storageOrgProcedure
    .route(aiUsageRoutes.overview)
    .output(aiUsageOverviewOutputSchema)
    .handler(async ({ context }) =>
      aiUsageOverviewOutputSchema.parse(
        await aiUsageOverviewService({
          organizationId: context.organizationId,
          isOrgOwner: context.isOrgOwner,
        })
      )
    ),
  usageHistory: storageOrgProcedure
    .route(aiUsageRoutes.usageHistory)
    .input(aiUsageHistoryInputSchema)
    .output(aiUsageHistoryOutputSchema)
    .handler(async ({ context, input }) =>
      aiUsageHistoryOutputSchema.parse(
        await aiUsageHistoryService({
          organizationId: context.organizationId,
          cursor: input.query?.cursor,
          limit: input.query?.limit,
        })
      )
    ),
  limitsAlertsGet: storageOrgProcedure
    .route(aiUsageRoutes.limitsAlertsGet)
    .output(aiUsageLimitsAlertsOutputSchema)
    .handler(async ({ context }) =>
      aiUsageLimitsAlertsOutputSchema.parse(
        await aiUsageLimitsAlertsGetService({
          organizationId: context.organizationId,
          isOrgOwner: context.isOrgOwner,
        })
      )
    ),
  limitsAlertsUpdate: aiUsageOrgOwnerProcedure
    .route(aiUsageRoutes.limitsAlertsUpdate)
    .input(aiUsageLimitsAlertsUpdateInputSchema)
    .output(aiUsageLimitsAlertsUpdateOutputSchema)
    .handler(async ({ context, input }) =>
      aiUsageLimitsAlertsUpdateOutputSchema.parse(
        await aiUsageLimitsAlertsUpdateService({
          organizationId: context.organizationId,
          isOrgOwner: context.isOrgOwner,
          payload: input.payload,
        })
      )
    ),
}
