import {
  activityController,
  unifiedActivityController,
} from "@modules/activity/server"
import { adminRouter } from "@modules/admin/server"
import { aiUsageRouter } from "@modules/ai-usage/server"
import { appearancePreferencesRouter } from "@modules/appearance-preferences/server"
import { billingRouter } from "@modules/billing/server"
import { connectedAccountsRouter } from "@modules/connected-accounts/server"
import { locationRouter } from "@modules/location/server"
import { notificationsRouter } from "@modules/notifications/server"
import { orgRouter } from "@modules/org/server"
import { privacyRouter } from "@modules/privacy/server"
import { regionalPreferencesRouter } from "@modules/regional-preferences/server"
import { sessionsRouter } from "@modules/sessions/server"
import { ssoRouter } from "@modules/sso/server"
import { storageRouter } from "@modules/storage/server"
import { securityAccountDeletionController } from "./security.account-deletion.controller"

export const securityRouter = {
  accountDeletion: securityAccountDeletionController,
  get admin() {
    return adminRouter
  },
  get sso() {
    return ssoRouter
  },
  get activity() {
    return { ...activityController, ...unifiedActivityController }
  },
  get appearancePreferences() {
    return appearancePreferencesRouter
  },
  get location() {
    return locationRouter
  },
  get sessions() {
    return sessionsRouter
  },
  get providers() {
    return connectedAccountsRouter.providers
  },
  get signInMethods() {
    return connectedAccountsRouter.signInMethods
  },
  get regionalPreferences() {
    return regionalPreferencesRouter
  },
  get storage() {
    return storageRouter
  },
  get billing() {
    return billingRouter
  },
  get aiUsage() {
    return aiUsageRouter
  },
  get org() {
    return orgRouter
  },
  get notifications() {
    return notificationsRouter
  },
  get privacy() {
    return privacyRouter
  },
}
