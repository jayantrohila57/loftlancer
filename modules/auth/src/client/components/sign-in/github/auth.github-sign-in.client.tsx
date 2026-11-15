"use client"

import { Button } from "@packages/ui/components/button"
import { useTranslations } from "next-intl"

import { useAuthSocialSignIn } from "../hooks/auth.social-sign-in.client"
import { AuthGithubIcon } from "../icons/auth.github-icon.client"

export type AuthGithubSignInProps = {
  readonly configured: boolean
}

export function AuthGithubSignIn({ configured }: AuthGithubSignInProps) {
  const t = useTranslations("ui")

  const { pending, signIn } = useAuthSocialSignIn("github", { configured })

  return (
    <div className="space-y-1">
      <Button
        className="w-full"
        disabled={!configured}
        loading={pending}
        onClick={() => void signIn()}
        type="button"
        variant="outline"
      >
        <AuthGithubIcon className="size-4" />
        {t("continueWithGitHub")}
      </Button>
      {!configured ? (
        <p className="text-center text-xs text-muted-foreground">
          {t("notConfigured")}
        </p>
      ) : null}
    </div>
  )
}
