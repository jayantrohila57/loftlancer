"use client"

import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"
import {
  AuthCheckEmailProvider,
  useAuthCheckEmailContext,
} from "./auth.check-email.context.client"
import { AuthCheckEmailActions } from "./auth.check-email-actions.client"
import { AuthCheckEmailResendButton } from "./auth.check-email-resend-button.client"

function AuthCheckEmailBody() {
  const t = useTranslations("ui")
  const { email } = useAuthCheckEmailContext()

  return (
    <Shell.Stack variant="form">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("checkYourEmail")}
        </h1>
        {email ? (
          <p className="text-sm text-muted-foreground">
            {t("checkEmailSentTo", { email })}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("checkEmailMissingEmail")}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {t("checkEmailDescription")}
        </p>
      </div>

      <AuthCheckEmailResendButton />
      <AuthCheckEmailActions />
    </Shell.Stack>
  )
}

export function AuthCheckEmailScreen() {
  return (
    <Shell.Section variant="center">
      <AuthCheckEmailProvider>
        <AuthCheckEmailBody />
      </AuthCheckEmailProvider>
    </Shell.Section>
  )
}
