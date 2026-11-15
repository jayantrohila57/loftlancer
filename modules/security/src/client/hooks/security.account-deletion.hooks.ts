"use client"

import { useDeleteAccount } from "./security.hook.delete-account"

export const useSecurityAccountDeletionApi = {
  useDelete: useDeleteAccount,
}
