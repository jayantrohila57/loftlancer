"use client"

import { FormKit } from "@features/form"
import { authClient } from "@packages/better-auth/client"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"
import { deviceAuthorizationUserCodeSchema } from "../../utils/validation/device-authorization.user-code.schema"
import { DeviceAuthorizationRequestDetails } from "./device-authorization.request-details.client"

type DeviceVerification = {
  readonly client_id?: string
  readonly scope?: string
  readonly status: string
  readonly user_code: string
}

export interface SecurityDeviceAuthorizationScreenProps {
  readonly initialUserCode?: string
}

export function SecurityDeviceAuthorizationScreen({
  initialUserCode,
}: SecurityDeviceAuthorizationScreenProps) {
  const t = useTranslations("ui")
  const searchParams = useSearchParams()
  const queryUserCode = searchParams.get("user_code") ?? undefined
  const [userCode, setUserCode] = useState(
    initialUserCode ?? queryUserCode ?? ""
  )
  const [verification, setVerification] = useState<DeviceVerification | null>(
    null
  )
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const loadVerification = useCallback(
    async (code: string) => {
      const trimmed = code.trim()
      if (!trimmed) {
        setVerification(null)
        return
      }
      setError(undefined)
      setBusy(true)
      try {
        const response = await authClient.$fetch<DeviceVerification>(
          "/device",
          {
            method: "GET",
            query: { user_code: trimmed },
          }
        )
        if (response.error) {
          setVerification(null)
          setError(t("deviceAuthorizationInvalidCode"))
          return
        }
        setVerification(response.data ?? null)
      } catch {
        setVerification(null)
        setError(t("deviceAuthorizationCouldNotLoadRequest"))
      } finally {
        setBusy(false)
      }
    },
    [t]
  )

  useEffect(() => {
    const code = initialUserCode ?? queryUserCode
    if (!code || sessionPending || !session?.user) return
    setUserCode(code)
    void loadVerification(code)
  }, [
    initialUserCode,
    loadVerification,
    queryUserCode,
    session?.user,
    sessionPending,
  ])

  async function onLookup(nextCode: string) {
    setUserCode(nextCode)
    await loadVerification(nextCode)
  }

  async function onApprove() {
    if (!userCode.trim()) return
    setBusy(true)
    setError(undefined)
    try {
      const response = await authClient.$fetch<{ success: boolean }>(
        "/device/approve",
        {
          method: "POST",
          body: { userCode: userCode.trim() },
        }
      )
      if (response.error || !response.data?.success) {
        setError(t("deviceAuthorizationApproveFailed"))
        return
      }
      toastManager.add({
        title: t("deviceAuthorizationApproved"),
        type: "success",
      })
      await loadVerification(userCode.trim())
    } catch {
      setError(t("deviceAuthorizationApproveFailed"))
    } finally {
      setBusy(false)
    }
  }

  async function onDeny() {
    if (!userCode.trim()) return
    setBusy(true)
    setError(undefined)
    try {
      const response = await authClient.$fetch<{ success: boolean }>(
        "/device/deny",
        {
          method: "POST",
          body: { userCode: userCode.trim() },
        }
      )
      if (response.error || !response.data?.success) {
        setError(t("deviceAuthorizationDenyFailed"))
        return
      }
      toastManager.add({
        title: t("deviceAuthorizationDenied"),
        type: "success",
      })
      await loadVerification(userCode.trim())
    } catch {
      setError(t("deviceAuthorizationDenyFailed"))
    } finally {
      setBusy(false)
    }
  }

  if (sessionPending) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>
  }

  if (!session?.user) {
    return (
      <Alert>
        <AlertDescription>
          {t("deviceAuthorizationSignInRequired")}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {t("deviceAuthorizationDescription")}
      </p>
      <FormKit
        schema={deviceAuthorizationUserCodeSchema}
        defaultValues={{ userCode }}
        onSubmit={async (values) => onLookup(values.userCode)}
      >
        <FormKit.Field
          type="text"
          name="userCode"
          label={t("deviceAuthorizationUserCode")}
          description={t("deviceAuthorizationUserCodeHint")}
          disabled={busy}
        />
        <FormKit.Actions>
          <FormKit.Submit />
        </FormKit.Actions>
      </FormKit>
      {verification ? (
        <DeviceAuthorizationRequestDetails
          clientId={verification.client_id}
          scope={verification.scope}
          status={verification.status}
          userCode={verification.user_code}
        />
      ) : null}
      {verification?.status === "pending" ? (
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => void onApprove()}>
            {t("deviceAuthorizationApprove")}
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => void onDeny()}
          >
            {t("deviceAuthorizationDeny")}
          </Button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
