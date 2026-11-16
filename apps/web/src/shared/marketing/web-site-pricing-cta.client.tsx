"use client"

import { buildAuthSignInLocation } from "@modules/auth"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Link } from "@/shared/i18n/web.i18n"
import type { PricingSessionState } from "@/shared/pricing/web-pricing-auth"
import {
  buildSignedInContinueLocation,
  readPricingSession,
} from "@/shared/pricing/web-pricing-auth"
import {
  pricingReturnTo,
  startPaidCheckoutFlow,
} from "@/shared/pricing/web-pricing-checkout-flow"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

type CtaKind = "start" | "checkout" | "contact"

export function WebSitePricingCta({
  className,
  kind,
  label,
  paidPlan,
  signInHref,
  size,
  variant,
}: {
  readonly className: string
  readonly kind: CtaKind
  readonly label: string
  readonly paidPlan: WebPricingPlanView | null
  readonly signInHref: string
  readonly size: "sm" | "lg"
  readonly variant: "default" | "outline"
}) {
  const locale = useLocale()
  const t = useTranslations("pricing")
  const [session, setSession] = useState<PricingSessionState | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (kind === "contact") return
    let cancelled = false
    void readPricingSession().then((state) => {
      if (!cancelled) setSession(state)
    })
    return () => {
      cancelled = true
    }
  }, [kind])

  if (kind === "contact") {
    return (
      <Button
        className={className}
        render={<Link href="/contact" />}
        size={size}
        variant={variant}
      >
        {label}
      </Button>
    )
  }

  if (!session) {
    return <Skeleton className={className} />
  }

  if (session.kind === "error") {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        <Button className={className} disabled size={size} variant={variant}>
          {label}
        </Button>
        <p className="min-h-5 text-sm text-destructive" role="alert">
          {t("errorSessionCheck")}
        </p>
      </div>
    )
  }

  const signedIn = session.kind !== "signed_out"

  if (kind === "start") {
    const href = signedIn
      ? buildSignedInContinueLocation({ locale })
      : signInHref
    return (
      <Button
        className={className}
        render={<a href={href} />}
        size={size}
        variant={variant}
      >
        {label}
      </Button>
    )
  }

  if (!paidPlan) {
    return (
      <Button
        className={className}
        render={<a href={signInHref} />}
        size={size}
        variant={variant}
      >
        {label}
      </Button>
    )
  }

  if (!signedIn) {
    return (
      <Button
        className={className}
        render={
          <a
            href={buildAuthSignInLocation({
              locale,
              returnTo: pricingReturnTo(locale, paidPlan.planId),
            })}
          />
        }
        size={size}
        variant={variant}
      >
        {label}
      </Button>
    )
  }

  async function onPaidClick() {
    if (!paidPlan) return
    setMessage(null)
    setPending(true)
    try {
      const result = await startPaidCheckoutFlow({
        locale,
        plan: paidPlan,
        source: "click",
      })
      if (result.kind === "redirect") {
        window.location.assign(result.url)
        return
      }
      setMessage(t(result.key))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button
        className={className}
        disabled={pending}
        onClick={() => void onPaidClick()}
        size={size}
        variant={variant}
      >
        {label}
      </Button>
      <p className="min-h-5 text-sm text-destructive" role="alert">
        {message}
      </p>
    </div>
  )
}
