import type { ActionItem } from "@features/action"
import { LogOut } from "lucide-react"

export type SessionsCommandTranslate = (
  key:
    | "revokeOtherSessionsCommandDescription"
    | "securityAndActivity"
    | "revokeOtherSessions"
    | "sessions"
    | "signOut"
) => string

export function defineSessionsCommandActions(
  translate: SessionsCommandTranslate
): readonly ActionItem[] {
  return [
    {
      activityActionId: "auth.session.revoke",
      description: translate("revokeOtherSessionsCommandDescription"),
      groupId: "account",
      groupLabel: translate("securityAndActivity"),
      handler: {
        href: "/account/security/sessions",
        kind: "href",
      },
      icon: LogOut,
      id: "account.security.sessions.revoke-others",
      keywords: [
        translate("revokeOtherSessions"),
        translate("sessions"),
        translate("signOut"),
        "logout",
        "devices",
      ],
      label: translate("revokeOtherSessions"),
      order: 10,
      parentId: "account.security",
      placements: ["command"],
    },
  ]
}
