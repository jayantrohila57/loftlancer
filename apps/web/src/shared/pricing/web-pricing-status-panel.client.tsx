"use client"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { CircleAlert, CircleCheck, CircleX, LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Link } from "@/shared/i18n/web.i18n"
import { getPricingSubscriptionStatus } from "@/shared/pricing/web-pricing-auth"

export type WebPricingStatusKind = "success" | "cancel" | "failure"

const VERIFY_ATTEMPTS = 5
const VERIFY_DELAY_MS = 2000

export function WebPricingStatusPanel({
  kind,
}: {
  readonly kind: WebPricingStatusKind
}) {
  const t = useTranslations("pricing")

  if (kind === "success") {
    return <WebPricingSuccessStatus />
  }

  const isFailure = kind === "failure"
  const Icon = isFailure ? CircleAlert : CircleX

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Alert variant={isFailure ? "error" : "default"}>
        <Icon />
        <AlertTitle>
          {isFailure ? t("statusFailureTitle") : t("statusCancelTitle")}
        </AlertTitle>
        <AlertDescription>
          {isFailure ? t("statusFailureBody") : t("statusCancelBody")}
        </AlertDescription>
      </Alert>
      <Button
        className="w-fit"
        render={<Link href="/pricing" />}
        variant="outline"
      >
        {t("backToPricing")}
      </Button>
    </div>
  )
}

function WebPricingSuccessStatus() {
  const t = useTranslations("pricing")
  const [phase, setPhase] = useState<"verifying" | "confirmed" | "unverified">(
    "verifying"
  )

  useEffect(() => {
    let cancelled = false

    async function verify() {
      for (let attempt = 0; attempt < VERIFY_ATTEMPTS; attempt += 1) {
        try {
          const result = await getPricingSubscriptionStatus()
          if (cancelled) return
          if (result.body.hasProduct) {
            setPhase("confirmed")
            return
          }
        } catch {
          // Keep retrying while Autumn or the webhook may still be catching up.
        }
        if (attempt < VERIFY_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, VERIFY_DELAY_MS))
        }
      }
      if (!cancelled) setPhase("unverified")
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [])

  if (phase === "verifying") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <Alert variant="info">
          <LoaderCircle className="animate-spin" />
          <AlertTitle>{t("statusVerifying")}</AlertTitle>
          <AlertDescription>
            <Skeleton className="mt-1 h-4 w-3/4" />
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (phase === "unverified") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <Alert variant="warning">
          <CircleAlert />
          <AlertTitle>{t("statusUnverifiedTitle")}</AlertTitle>
          <AlertDescription>{t("statusUnverified")}</AlertDescription>
        </Alert>
        <Button
          className="w-fit"
          render={<Link href="/pricing" />}
          variant="outline"
        >
          {t("backToPricing")}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Alert variant="success">
        <CircleCheck />
        <AlertTitle>{t("statusSuccessTitle")}</AlertTitle>
        <AlertDescription>{t("statusSuccessBody")}</AlertDescription>
      </Alert>
      <Button
        className="w-fit"
        render={<Link href="/pricing" />}
        variant="outline"
      >
        {t("backToPricing")}
      </Button>
    </div>
  )
}
