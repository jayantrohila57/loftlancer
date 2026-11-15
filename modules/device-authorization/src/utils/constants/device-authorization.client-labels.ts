/** Friendly labels for approved first-party device-flow client IDs. */
export const deviceAuthorizationClientLabelKeys = {
  "loftlancer-cli": "deviceAuthorizationClientLoftlancerCli",
  "studio-cli": "deviceAuthorizationClientStudioCli",
} as const

export type DeviceAuthorizationKnownClientId =
  keyof typeof deviceAuthorizationClientLabelKeys

export function deviceAuthorizationClientLabelKey(
  clientId: string
):
  | (typeof deviceAuthorizationClientLabelKeys)[DeviceAuthorizationKnownClientId]
  | null {
  return clientId in deviceAuthorizationClientLabelKeys
    ? deviceAuthorizationClientLabelKeys[
        clientId as DeviceAuthorizationKnownClientId
      ]
    : null
}
