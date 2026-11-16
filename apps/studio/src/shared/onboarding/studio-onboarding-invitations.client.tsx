"use client"

import {
  OrgInvitationsScreen,
  readOrganizationSlugFromResponse,
} from "@modules/org/account-screens"
import { useRouter } from "@/shared/i18n/studio.i18n"

export function StudioOnboardingInvitations() {
  const router = useRouter()
  return (
    <OrgInvitationsScreen
      onAccepted={(data) => {
        const slug = readOrganizationSlugFromResponse(data)
        if (slug) {
          router.push(`/${slug}`)
          return
        }
        router.refresh()
      }}
    />
  )
}