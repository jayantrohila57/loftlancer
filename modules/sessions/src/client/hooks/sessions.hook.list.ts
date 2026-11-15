"use client"
import { isTransientError } from "@modules/auth"
import { useQuery } from "@packages/react-query"
import { fetchSessionsList } from "./sessions.hook.list-query"
import { sessionKey } from "./sessions.hooks.keys"
export function useSessions(userId: string | undefined) {
  return useQuery({
    queryKey: sessionKey(userId),
    enabled: Boolean(userId),
    queryFn: () => fetchSessionsList(),
    retry: (failureCount, error) => isTransientError(error) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000, 250 * 2 ** attempt),
  })
}
