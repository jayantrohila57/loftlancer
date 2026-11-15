"use client"

import { Button } from "@packages/ui/components/button"
import { Spinner } from "@packages/ui/components/spinner"
import { useTranslations } from "next-intl"

import { useAuthSsoSignInContext } from "./auth.sso-sign-in.context.client"

export function AuthSsoSubmitButton() {
  const t = useTranslations("ui")
  const { pending } = useAuthSsoSignInContext()

  return (
    <Button className="w-full" disabled={pending} size="lg" type="submit">
      {pending ? (
        <>
          <Spinner className="size-4" />
          {t("redirectingToSso")}
        </>
      ) : (
        t("continueWithSso")
      )}
    </Button>
  )
}
