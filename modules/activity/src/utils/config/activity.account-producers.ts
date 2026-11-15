import type { ActivityActionId } from "./activity.actions"
import { activityActions } from "./activity.actions"

/** How the server persists a registered action into `activity_event` (or equivalent). */
export type ActivityProducerKind =
  | "native-record"
  | "legacy-dual-write"
  | "diagnostic-only"

export type ActivityProducerRegistration = {
  actionId: ActivityActionId
  kind: ActivityProducerKind
  /** Repo-relative path exercised in producer coverage tests. */
  source: string
  /** Auth page-action report IDs (`docs/work/auth-page-action-report.md`). */
  reportIds: readonly string[]
  notes?: string
}

export const activityProducerRegistrations = [
  {
    actionId: "account.profile.update",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-PROFILE-02"],
  },
  {
    actionId: "account.avatar.update",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-PROFILE-03"],
  },
  {
    actionId: "account.avatar.remove",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-PROFILE-03"],
  },
  {
    actionId: "auth.sign_in",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-SIGN-01", "AUTH-SIGN-03", "AUTH-SSO-01"],
  },
  {
    actionId: "auth.sign_out",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-SH-03"],
  },
  {
    actionId: "auth.session.revoke",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-SESSION-02"],
  },
  {
    actionId: "auth.session.end",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-SESSION-03"],
  },
  {
    actionId: "security.provider.link",
    kind: "native-record",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-CONNECT-02"],
  },
  {
    actionId: "security.provider.unlink",
    kind: "legacy-dual-write",
    source:
      "modules/security/src/server/shared/security.auth-database-hooks.ts",
    reportIds: ["AUTH-CONNECT-03"],
  },
  {
    actionId: "security.device_authorization.approve",
    kind: "native-record",
    source:
      "modules/security/src/server/shared/security.device-authorization-activity.ts",
    reportIds: ["AUTH-DEVICE-02"],
  },
  {
    actionId: "security.device_authorization.deny",
    kind: "native-record",
    source:
      "modules/security/src/server/shared/security.device-authorization-activity.ts",
    reportIds: ["AUTH-DEVICE-03"],
  },
  {
    actionId: "security.account.delete",
    kind: "diagnostic-only",
    source: "modules/security/src/server/shared/security.delete-user.ts",
    reportIds: ["AUTH-DELETE-01"],
    notes:
      "beginActivity + structured logs only; no activity_event row per account-data-retention-deletion.md",
  },
  {
    actionId: "privacy.location_preference.update",
    kind: "native-record",
    source:
      "modules/location/src/server/repositories/location.repository.location.preference.set.ts",
    reportIds: ["AUTH-PERM-02", "AUTH-CONT-01"],
  },
  {
    actionId: "privacy.location_history.delete",
    kind: "native-record",
    source:
      "modules/location/src/server/services/location.service.location.delete.ts",
    reportIds: ["AUTH-PERM-03"],
  },
  {
    actionId: "notifications.preference.update",
    kind: "native-record",
    source:
      "modules/notifications/src/server/repositories/notifications.repository.ts",
    reportIds: ["AUTH-NOTIFY-01"],
  },
  {
    actionId: "privacy.consent.update",
    kind: "native-record",
    source:
      "modules/privacy/src/server/repositories/privacy.repository.consents.ts",
    reportIds: ["AUTH-PERM-04"],
  },
  {
    actionId: "privacy.data_export.request",
    kind: "native-record",
    source:
      "modules/privacy/src/server/repositories/privacy.repository.data-export.ts",
    reportIds: ["AUTH-EXPORT-01"],
  },
  {
    actionId: "preferences.regional.update",
    kind: "native-record",
    source:
      "modules/regional-preferences/src/server/repositories/regional-preferences.repository.ts",
    reportIds: [
      "AUTH-LANG-01",
      "AUTH-REGION-01",
      "AUTH-DATE-01",
      "AUTH-NUM-01",
      "AUTH-CURRENCY-01",
      "AUTH-MEASURE-01",
    ],
  },
  {
    actionId: "preferences.appearance.update",
    kind: "native-record",
    source:
      "modules/appearance-preferences/src/server/repositories/appearance-preferences.repository.ts",
    reportIds: [
      "AUTH-THEME-01",
      "AUTH-DENSITY-01",
      "AUTH-ZOOM-01",
      "AUTH-SIDEBAR-01",
    ],
  },
  {
    actionId: "billing.plan_changed",
    kind: "native-record",
    source: "modules/billing/src/server/services/billing.service.activity.ts",
    reportIds: ["AUTH-SUB-01", "AUTH-PLAN-02", "AUTH-BILL-02"],
  },
  {
    actionId: "storage.upload",
    kind: "native-record",
    source:
      "modules/storage/src/server/services/storage.service.complete-upload.ts",
    reportIds: ["AUTH-FILES-02", "AUTH-STORAGE-ACT-01"],
  },
  {
    actionId: "storage.quota_denied",
    kind: "native-record",
    source:
      "modules/storage/src/server/services/storage.service.init-upload.ts",
    reportIds: ["AUTH-FILES-02", "AUTH-STORAGE-01"],
  },
  {
    actionId: "storage.delete",
    kind: "native-record",
    source: "modules/storage/src/server/services/storage.service.trash.ts",
    reportIds: ["AUTH-TRASH-01", "AUTH-FILES-02", "AUTH-STORAGE-ACT-01"],
  },
  {
    actionId: "storage.restore",
    kind: "native-record",
    source: "modules/storage/src/server/services/storage.service.trash.ts",
    reportIds: ["AUTH-TRASH-01", "AUTH-STORAGE-ACT-01"],
  },
  {
    actionId: "storage.grant.create",
    kind: "native-record",
    source: "modules/storage/src/server/services/storage.service.grants.ts",
    reportIds: ["AUTH-FILES-03"],
  },
  {
    actionId: "storage.grant.revoke",
    kind: "native-record",
    source: "modules/storage/src/server/services/storage.service.grants.ts",
    reportIds: ["AUTH-FILES-03"],
  },
  {
    actionId: "storage.purge",
    kind: "native-record",
    source: "modules/storage/src/server/services/storage.service.purge.ts",
    reportIds: ["AUTH-TRASH-02"],
  },
  {
    actionId: "admin.users.list",
    kind: "native-record",
    source: "modules/admin/src/server/services/admin.service.users.list.ts",
    reportIds: [],
    notes: "Console administration; not an Auth account screen action",
  },
  {
    actionId: "admin.sso.connections.list",
    kind: "native-record",
    source: "modules/sso/src/server/services/sso.service.connections.list.ts",
    reportIds: [],
    notes: "Console administration; not an Auth account screen action",
  },
] as const satisfies readonly ActivityProducerRegistration[]

const registeredActionIds = Object.keys(activityActions) as ActivityActionId[]

export function producerRegistrationFor(
  actionId: ActivityActionId
): ActivityProducerRegistration | undefined {
  return activityProducerRegistrations.find(
    (entry) => entry.actionId === actionId
  )
}

/** Registered actions that should surface on Auth account activity feeds (excludes Console-only admin reads). */
export const authAccountActivityActionIds = registeredActionIds.filter(
  (actionId) => !actionId.startsWith("admin.")
)
