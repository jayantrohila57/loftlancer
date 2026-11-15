"use client"

import { FormKit } from "@features/form"
import { serviceResponseFailureMessage } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { z } from "zod"
import { PrivacyAccountFrame } from "./privacy.frame"

export function PrivacyDataExportScreen() {
  const t = useTranslations("privacyDataExport")
  const { data: session, isPending } = authClient.useSession()
  const [submitted, setSubmitted] = useState(false)
  const schema = useMemo(
    () =>
      z.object({
        message: z.string().max(2000, t("messageTooLong")).optional(),
      }),
    [t]
  )

  if (isPending || !session?.user) {
    return (
      <PrivacyAccountFrame
        activityTarget="account.privacy-data.data-export"
        description={t("pageDescription")}
        title={t("pageTitle")}
      >
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </PrivacyAccountFrame>
    )
  }

  return (
    <PrivacyAccountFrame
      activityTarget="account.privacy-data.data-export"
      description={t("pageDescription")}
      title={t("pageTitle")}
    >
      {submitted ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("submittedDescription")}
        </p>
      ) : (
        <FormKit
          variant="embedded"
          schema={schema}
          defaultValues={{ message: "" }}
          onSubmit={async (values) => {
            try {
              await toastManager.promise(
                (async () => {
                  const trimmed = values.message?.trim()
                  const result =
                    await securityRpc.security.privacy.dataExport.request({
                      payload: {
                        ...(trimmed ? { message: trimmed } : {}),
                      },
                    })
                  if (result.status !== "success") {
                    throw new Error(
                      serviceResponseFailureMessage(result, {
                        invalid: t("invalid"),
                        fallback: t("submitError"),
                      })
                    )
                  }
                  setSubmitted(true)
                })(),
                {
                  loading: t("submitting"),
                  success: t("submitSuccess"),
                  error: t("submitError"),
                }
              )
            } catch {
              /* Toast reports failure. */
            }
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("manualProcessDescription")}
            </p>
            <FormKit.Field
              name="message"
              type="textarea"
              label={t("messageLabel")}
              description={t("messageDescription")}
            />
            <FormKit.Actions>
              <FormKit.Submit />
            </FormKit.Actions>
          </div>
        </FormKit>
      )}
    </PrivacyAccountFrame>
  )
}
