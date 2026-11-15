"use client"

import { securityActivityApi } from "@modules/activity/client"
import { securityAccountsApi } from "@modules/connected-accounts/client"
import { securityLocationApi } from "@modules/location/client"
import { securityApi as securitySessionsApi } from "@modules/sessions/client"

type SecurityClientApi = typeof securityAccountsApi &
  typeof securityActivityApi &
  typeof securitySessionsApi &
  typeof securityLocationApi

export const api: { security: SecurityClientApi } = {
  security: {
    ...securityAccountsApi,
    ...securityActivityApi,
    ...securitySessionsApi,
    ...securityLocationApi,
  },
}
