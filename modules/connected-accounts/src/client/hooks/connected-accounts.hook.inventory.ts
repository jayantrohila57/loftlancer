"use client"

import { useQuery } from "@packages/react-query"
import { fetchSignInMethodInventory } from "./connected-accounts.hook.inventory-query"
import { signInMethodsKey } from "./connected-accounts.hooks.keys"

export function useSignInMethodInventory(userId: string | undefined) {
  return useQuery({
    queryKey: signInMethodsKey(userId),
    enabled: Boolean(userId),
    queryFn: () => fetchSignInMethodInventory(),
  })
}
