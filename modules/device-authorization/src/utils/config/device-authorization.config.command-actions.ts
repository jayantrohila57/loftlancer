import type { ActionItem } from "@features/action"
import { Terminal } from "lucide-react"

export type DeviceAuthorizationCommandTranslate = (
  key:
    | "deviceAuthorizationCommandDescription"
    | "securityAndActivity"
    | "deviceAuthorization"
) => string

export function defineDeviceAuthorizationCommandActions(
  translate: DeviceAuthorizationCommandTranslate
): readonly ActionItem[] {
  return [
    {
      description: translate("deviceAuthorizationCommandDescription"),
      groupId: "account",
      groupLabel: translate("securityAndActivity"),
      handler: {
        href: "/account/security/device-authorization",
        kind: "href",
      },
      icon: Terminal,
      id: "account.security.device-authorization.open",
      keywords: [
        translate("deviceAuthorization"),
        "cli",
        "device",
        "oauth",
        "rfc8628",
      ],
      label: translate("deviceAuthorization"),
      order: 12,
      parentId: "account.security.device-authorization",
      placements: ["command"],
    },
  ]
}
