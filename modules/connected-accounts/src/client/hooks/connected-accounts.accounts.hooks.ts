"use client"
import { useSignInMethodInventory } from "./connected-accounts.hook.inventory"
import { useLinkAccount } from "./connected-accounts.hook.link"
import { useAccounts } from "./connected-accounts.hook.list"
import { useProviders } from "./connected-accounts.hook.providers"
import { useUnlinkAccount } from "./connected-accounts.hook.unlink"
export const useConnectedAccountsApi = {
  useList: useAccounts,
  useInventory: useSignInMethodInventory,
  useProviders,
  useLink: useLinkAccount,
  useUnlink: useUnlinkAccount,
}
export const securityAccountsApi = {
  useAccounts,
  useSignInMethodInventory,
  useProviders,
  useLinkAccount,
  useUnlinkAccount,
}
