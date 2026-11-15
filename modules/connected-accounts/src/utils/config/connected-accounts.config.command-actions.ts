import type { ActionItem } from "@features/action"
import { Link2 } from "lucide-react"

export type ConnectedAccountsCommandTranslate = (
  key:
    | "signInMethodsCommandDescription"
    | "securityAndActivity"
    | "signInMethods"
    | "connectedAccounts"
) => string

export function defineConnectedAccountsCommandActions(
  translate: ConnectedAccountsCommandTranslate
): readonly ActionItem[] {
  return [
    {
      description: translate("signInMethodsCommandDescription"),
      groupId: "account",
      groupLabel: translate("securityAndActivity"),
      handler: {
        href: "/account/security/connected-accounts",
        kind: "href",
      },
      icon: Link2,
      id: "account.security.connected-accounts.sign-in-methods",
      keywords: [
        translate("signInMethods"),
        translate("connectedAccounts"),
        "github",
        "oauth",
      ],
      label: translate("signInMethods"),
      order: 11,
      parentId: "account.security",
      placements: ["command"],
    },
  ]
}
