"use client"

import { buildAuthSignInLocation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Link } from "@/shared/i18n/web.i18n"
import {
  buildSignedInContinueLocation,
  postPricingCheckout,
} from "@/shared/pricing/web-pricing-auth"
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
  const [mounted, setMounted] = useState(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted || isPending) {
    return <Skeleton className={className} />
  }

  const signedIn = Boolean(data?.user)

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

  async function startPaidCheckout() {
    if (!paidPlan) return
    setMessage(null)
    setPending(true)
    try {
      const origin = window.location.origin
      const successUrl = `${origin}/${locale}/billing/success?plan=${encodeURIComponent(paidPlan.planId)}`
      const cancelUrl = `${origin}/${locale}/billing/cancel?plan=${encodeURIComponent(paidPlan.planId)}`
      const result = await postPricingCheckout({
        planId: paidPlan.planId,
        successUrl,
        cancelUrl,
        returnTo: pricingReturnTo(locale, paidPlan.planId),
        locale,
      })
      if (result.status === 401) {
        window.location.assign(
          buildAuthSignInLocation({
            locale,
            returnTo: pricingReturnTo(locale, paidPlan.planId),
          })
        )
        return
      }
      if (result.status === 409 && result.body.createOrganizationUrl) {
        window.location.assign(result.body.createOrganizationUrl)
        return
      }
      if (result.body.error === "owner_required") {
        setMessage(t("errorOwnerRequired"))
        return
      }
      if (result.body.alreadySubscribed) {
        window.location.assign(successUrl)
        return
      }
      if (result.body.paymentUrl) {
        window.location.assign(result.body.paymentUrl)
        return
      }
      setMessage(checkoutErrorMessage(result.body.error, t))
    } catch {
      setMessage(t("errorGeneric"))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button
        className={className}
        disabled={pending}
        onClick={() => void startPaidCheckout()}
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

function pricingReturnTo(locale: string, planId: string): string {
  return `${window.location.origin}/${locale}/pricing?plan=${encodeURIComponent(planId)}`
}

function checkoutErrorMessage(
  code: string | undefined,
  t: (
    key:
      | "errorGeneric"
      | "errorBillingUnavailable"
      | "errorOrganizationRequired"
      | "errorOwnerRequired"
      | "errorAlreadySubscribed"
  ) => string
): string {
  if (code === "organization_required") return t("errorOrganizationRequired")
  if (code === "owner_required") return t("errorOwnerRequired")
  if (code === "already_subscribed") return t("errorAlreadySubscribed")
  if (
    code === "autumn_unconfigured" ||
    code === "autumn_unavailable" ||
    code === "database_unavailable"
  ) {
    return t("errorBillingUnavailable")
  }
  return t("errorGeneric")
}
