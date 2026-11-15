"use client"
import {
  isTransientError,
  TransientClientError,
  withClientRetry,
} from "@modules/auth/utils/auth.client-retry"
import {
  isTransientSecurityRpcCode,
  securityRpc,
} from "@modules/security/client"
import { useQuery } from "@packages/react-query"
import { useCallback } from "react"
import type { LocationOutput } from "../../utils/types/location.types"

async function fetchLocationState(): Promise<LocationOutput> {
  return withClientRetry(async () => {
    const response = await securityRpc.security.location.get()
    if (response.status === "error") {
      const code = response.error?.code
      if (isTransientSecurityRpcCode(code)) {
        throw new TransientClientError(
          response.message,
          response.error ?? { code: code ?? "LOCATION_UNAVAILABLE" }
        )
      }
      throw new Error(response.message)
    }
    return response
  })
}

export function useLocation(userId: string | undefined) {
  return useQuery({
    queryKey: ["security", "location", userId],
    enabled: Boolean(userId),
    queryFn: fetchLocationState,
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
  })
}
export function useReadLocation(): () => Promise<LocationOutput> {
  return useCallback(() => fetchLocationState(), [])
}
