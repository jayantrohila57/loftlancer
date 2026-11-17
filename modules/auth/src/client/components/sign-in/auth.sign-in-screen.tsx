import type { SocialProviderAvailability } from "@packages/better-auth"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"
import { authSignInLayout } from "./auth.sign-in-layout"
import { AuthSignInLegalNotice } from "./auth.sign-in-legal-notice.client"
import { AuthSignInOauthFeedback } from "./auth.sign-in-oauth-feedback.client"
import { AuthGithubSignIn } from "./github/auth.github-sign-in.client"
import { AuthGoogleSignIn } from "./google/auth.google-sign-in.client"
import { AuthMagicLinkForm } from "./magic-link/auth.magic-link-form.client"

export type AuthSignInScreenProps = {
  enterpriseSsoHref?: string
  socialProviders: SocialProviderAvailability
}

export function AuthSignInScreen(props: AuthSignInScreenProps) {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="center">
      <AuthSignInOauthFeedback />
      <Shell.Stack variant="form">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("signIn")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("googleGitHubOrEmailMagicLink")}
          </p>
        </div>

        <div className={authSignInLayout.socialStack}>
          <AuthGoogleSignIn configured={props.socialProviders.google} />
          <AuthGithubSignIn configured={props.socialProviders.github} />
        </div>

        <AuthMagicLinkForm />

        <AuthSignInLegalNotice />

        {props.enterpriseSsoHref ? (
          <p className="text-center text-sm">
            <a
              className="text-primary underline-offset-4 hover:underline"
              href={props.enterpriseSsoHref}
            >
              {t("enterpriseSso")}
            </a>
          </p>
        ) : null}
      </Shell.Stack>
    </Shell.Section>
  )
}
