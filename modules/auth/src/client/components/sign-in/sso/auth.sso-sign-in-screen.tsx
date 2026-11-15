"use client"

import Shell from "@packages/ui/components/shell"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { AuthSsoSignInForm } from "./auth.sso-sign-in-form.client"

export type AuthSsoSignInScreenProps = {
  backToSignInHref: string
  docsHref: string
}

export function AuthSsoSignInScreen(props: AuthSsoSignInScreenProps) {
  const t = useTranslations("ui")
  const params = useSearchParams()
  const error = params.get("error")

  return (
    <Shell.Section variant="center">
      <Shell.Stack variant="form">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("enterpriseSso")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("enterpriseSsoDescription")}
          </p>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {t("enterpriseSsoCallbackError")}
          </p>
        ) : null}

        <AuthSsoSignInForm />

        <p className="text-center text-sm text-muted-foreground">
          {t("enterpriseSsoRecoveryHint")}{" "}
          <a
            className="text-primary underline-offset-4 hover:underline"
            href={props.docsHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("enterpriseSsoDocsLink")}
          </a>
        </p>

        <p className="text-center text-sm">
          <a
            className="text-primary underline-offset-4 hover:underline"
            href={props.backToSignInHref}
          >
            {t("otherSignInOptions")}
          </a>
        </p>
      </Shell.Stack>
    </Shell.Section>
  )
}
