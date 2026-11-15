import type { ActionItem } from "@features/action"
import { UserRoundX } from "lucide-react"

export type SecurityCommandTranslate = (
  key:
    | "deleteAccountPageDescription"
    | "privacyAndData"
    | "accountDeletion"
    | "deleteAccount"
) => string

export function defineAccountDeletionCommandActions(
  translate: SecurityCommandTranslate
): readonly ActionItem[] {
  return [
    {
      activityActionId: "security.account.delete",
      description: translate("deleteAccountPageDescription"),
      groupId: "account",
      groupLabel: translate("privacyAndData"),
      handler: {
        href: "/account/privacy-data/account-deletion",
        kind: "href",
      },
      icon: UserRoundX,
      id: "account.privacy-data.delete-account",
      keywords: [
        translate("accountDeletion"),
        translate("deleteAccount"),
        "privacy",
        "gdpr",
      ],
      label: translate("accountDeletion"),
      order: 5,
      parentId: "account.privacy-data",
      placements: ["command"],
    },
  ]
}
