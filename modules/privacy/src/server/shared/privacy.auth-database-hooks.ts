import type { BetterAuthDatabaseHooks } from "@packages/better-auth"
import { brandLegal } from "@packages/brand"
import { logger } from "@packages/logger/server"

import { recordUserLegalAcceptance } from "../repositories/privacy.repository.legal-acceptance"

export function buildPrivacyAuthDatabaseHooks(): BetterAuthDatabaseHooks {
  return {
    user: {
      create: {
        after: async (createdUser) => {
          try {
            await recordUserLegalAcceptance({
              userId: createdUser.id,
              termsVersion: brandLegal.termsVersion,
            })
          } catch {
            logger.error("privacy.legal_acceptance_record_failed", {
              app: "auth",
              module: "privacy",
              outcome: "error",
            })
          }
        },
      },
    },
  }
}
