"use client"

import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import Shell from "@packages/ui/components/shell"
import { CircleAlert } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { resolveAuthPortalErrorDescriptionKey } from "../../../utils/auth.portal-error"
import { useAuthSignInPaths } from "../sign-in/hooks/auth.sign-in-paths.client"

export function AuthErrorScreen() {
  const t = useTranslations("ui")
  const searchParams = useSearchParams()
  const { signInURL } = useAuthSignInPaths()
  const descriptionKey = resolveAuthPortalErrorDescriptionKey(
    searchParams.get("error")
  )

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleAlert aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{t("authErrorTitle")}</EmptyTitle>
            <EmptyDescription>{t(descriptionKey)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<a href={signInURL} />}>{t("backToSignIn")}</Button>
          </EmptyContent>
        </Empty>
      </Shell.Stack>
    </Shell.Section>
  )
}
