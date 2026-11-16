"use client"

import { buildAuthSignInLocation } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import {
  buildCreateOrganizationLocation,
  buildSignedInContinueLocation,
  postPricingCheckout,
} from "@/shared/pricing/web-pricing-auth"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

export function WebPricingCheckoutButton({
  plan,
}: {
  readonly plan: WebPricingPlanView
}) {
  const locale = useLocale()
  const t = useTranslations("pricing")
  const [mounted, setMounted] = useState(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { data, isPending } = authClient.useSession()
  const isPaid = plan.tier === "paid"

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isPending) {
    return <Skeleton className="h-9 w-full" />
  }

  const signedIn = Boolean(data?.user)

  async function startPaidCheckout() {
    setMessage(null)
    setPending(true)
    try {
      const origin = window.location.origin
      const successUrl = `${origin}/${locale}/billing/success?plan=${encodeURIComponent(plan.planId)}`
      const cancelUrl = `${origin}/${locale}/billing/cancel?plan=${encodeURIComponent(plan.planId)}`
      const result = await postPricingCheckout({
        planId: plan.planId,
        successUrl,
        cancelUrl,
        returnTo: pricingReturnTo(locale, plan.planId),
        locale,
      })
      if (result.status === 401) {
        window.location.assign(
          buildAuthSignInLocation({
            locale,
            returnTo: pricingReturnTo(locale, plan.planId),
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

  if (!isPaid) {
    const href = signedIn
      ? buildSignedInContinueLocation({ locale })
      : buildAuthSignInLocation({ locale })
    return (
      <Button className="w-full" render={<a href={href} />} variant="outline">
        {t("ctaGetStarted")}
      </Button>
    )
  }

  if (!signedIn) {
    return (
      <Button
        className="w-full"
        render={
          <a
            href={buildAuthSignInLocation({
              locale,
              returnTo: pricingReturnTo(locale, plan.planId),
            })}
          />
        }
      >
        {t("ctaSubscribe")}
      </Button>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        className="w-full"
        disabled={pending}
        onClick={() => void startPaidCheckout()}
      >
        {t("ctaSubscribe")}
      </Button>
      <p className="min-h-5 text-sm text-destructive" role="alert">
        {message}
      </p>
    </div>
  )
}

export function WebPricingCheckoutResume({
  planId,
  plans,
}: {
  readonly planId: string | null
  readonly plans: readonly WebPricingPlanView[]
}) {
  const locale = useLocale()
  const t = useTranslations("pricing")
  const { data, isPending } = authClient.useSession()
  const started = useRef(false)
  const [message, setMessage] = useState<string | null>(null)
  const plan = plans.find((entry) => entry.planId === planId) ?? null

  useEffect(() => {
    if (isPending || started.current || !plan || plan.tier !== "paid") return
    if (!data?.user) return
    started.current = true
    const origin = window.location.origin
    const successUrl = `${origin}/${locale}/billing/success?plan=${encodeURIComponent(plan.planId)}`
    const cancelUrl = `${origin}/${locale}/billing/cancel?plan=${encodeURIComponent(plan.planId)}`
    void postPricingCheckout({
      planId: plan.planId,
      successUrl,
      cancelUrl,
      returnTo: pricingReturnTo(locale, plan.planId),
      locale,
    })
      .then((result) => {
        if (result.status === 409 && result.body.createOrganizationUrl) {
          window.location.assign(
            result.body.createOrganizationUrl ||
              buildCreateOrganizationLocation({
                locale,
                returnTo: pricingReturnTo(locale, plan.planId),
              })
          )
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
        if (result.body.error) {
          setMessage(checkoutErrorMessage(result.body.error, t))
        }
      })
      .catch(() => {
        setMessage(t("errorGeneric"))
      })
  }, [data?.user, isPending, locale, plan, t])

  if (!message) return null

  return (
    <p className="mx-auto max-w-5xl text-sm text-destructive" role="alert">
      {message}
    </p>
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
