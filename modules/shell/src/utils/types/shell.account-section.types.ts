export type AccountSectionKey =
  | "home"
  | "overview"
  | "profile"
  | "activity"
  | "permissions"
  | "organization"
  | "security"
  | "languageRegion"
  | "appearance"
  | "unavailable"
  | "notifications"
  | "aiUsage"
  | "storage"
  | "subscription"
  | "billing"
  | "privacyData"
  | "helpSupport"

export interface AccountSectionTabItem {
  readonly href: string
  readonly label: string
  readonly value: string
}
