"use client"

import { refreshAuthSession, runAuthMutation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { useMutation } from "@packages/react-query"
import type { ProfileUpdateInput } from "../../utils/types/profile.types.update"
import { profileUpdateInputSchema } from "../../utils/validation/profile.validation.update"

export function useUpdateProfile() {
  const { refetch } = authClient.useSession()
  return useMutation({
    mutationFn: async (input: ProfileUpdateInput) => {
      const parsed = profileUpdateInputSchema.safeParse(input)
      if (!parsed.success) {
        throw new Error("Could not update your profile.")
      }
      await runAuthMutation(
        () => authClient.updateUser(parsed.data),
        "Could not update your profile."
      )
    },
    onSuccess: async () => {
      await refreshAuthSession(refetch)
    },
  })
}
