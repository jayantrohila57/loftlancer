"use client"

import { Button } from "@packages/ui/components/button"
import { useTranslations } from "next-intl"

import { useAuthSocialSignIn } from "../hooks/auth.social-sign-in.client"
import { AuthGoogleIcon } from "../icons/auth.google-icon.client"

export type AuthGoogleSignInProps = {
  readonly configured: boolean
}

const unavailableHintId = "auth-google-sign-in-unavailable"

export function AuthGoogleSignIn({ configured }: AuthGoogleSignInProps) {
  const t = useTranslations("ui")

  const { pending, signIn } = useAuthSocialSignIn("google", { configured })

  return (
    <div className="space-y-1">
      <Button
        aria-describedby={configured ? undefined : unavailableHintId}
        className="w-full"
        disabled={!configured}
        loading={pending}
        onClick={() => void signIn()}
        type="button"
        variant="outline"
      >
        <AuthGoogleIcon className="size-4" />
        {t("continueWithGoogle")}
      </Button>
      {!configured ? (
        <p
          className="text-center text-xs text-muted-foreground"
          id={unavailableHintId}
        >
          {t("socialSignInNotConfigured", { provider: t("google") })}
        </p>
      ) : null}
    </div>
  )
}
