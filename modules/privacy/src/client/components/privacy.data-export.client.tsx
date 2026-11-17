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
  const [result, setResult] = useState<{
    readonly downloadUrl?: string
    readonly expiresAt?: string
  } | null>(null)
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
      {result ? (
        <div className="space-y-3 text-sm text-muted-foreground" role="status">
          <p>{t("submittedDescription")}</p>
          {result.downloadUrl ? (
            <p>
              <a
                className="font-medium text-foreground underline"
                href={result.downloadUrl}
                rel="noreferrer"
              >
                {t("downloadLink")}
              </a>
              {result.expiresAt ? (
                <span className="block text-xs">
                  {t("linkExpires", { date: result.expiresAt })}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
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
                  const response =
                    await securityRpc.security.privacy.dataExport.request({
                      payload: {
                        ...(trimmed ? { message: trimmed } : {}),
                      },
                    })
                  if (response.status !== "success") {
                    if (response.error?.code === "DATA_EXPORT_RATE_LIMITED") {
                      throw new Error(t("rateLimited"))
                    }
                    throw new Error(
                      serviceResponseFailureMessage(response, {
                        invalid: t("invalid"),
                        fallback: t("submitError"),
                      })
                    )
                  }
                  setResult({
                    downloadUrl: response.data?.downloadUrl,
                    expiresAt: response.data?.expiresAt,
                  })
                })(),
                {
                  loading: t("submitting"),
                  success: t("submitSuccess"),
                  error: (err) =>
                    err instanceof Error ? err.message : t("submitError"),
                }
              )
            } catch {
              /* Toast reports failure. */
            }
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("selfServeDescription")}
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
