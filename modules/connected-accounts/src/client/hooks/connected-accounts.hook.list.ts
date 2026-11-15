"use client"
import { useQuery } from "@packages/react-query"
import { fetchConnectedAccounts } from "./connected-accounts.hook.list-query"
import { accountsKey } from "./connected-accounts.hooks.keys"

export function useAccounts(userId: string | undefined) {
  return useQuery({
    queryKey: accountsKey(userId),
    enabled: Boolean(userId),
    queryFn: () => fetchConnectedAccounts(),
  })
}
