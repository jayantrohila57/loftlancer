"use client"

import { buildAuthSignInLocation } from "@modules/auth"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "@/shared/i18n/web.i18n"
import type { PricingSessionState } from "@/shared/pricing/web-pricing-auth"
import {
  buildSignedInContinueLocation,
  readPricingResumeGuard,
  readPricingSession,
  writePricingResumeGuard,
} from "@/shared/pricing/web-pricing-auth"
import { startPaidCheckoutFlow } from "@/shared/pricing/web-pricing-checkout-flow"
import type { WebPricingPlanView } from "@/shared/pricing/web-pricing-types"

export function WebPricingCheckoutButton({
  plan,
}: {
  readonly plan: WebPricingPlanView
}) {
  const locale = useLocale()
  const t = useTranslations("pricing")
  const [session, setSession] = useState<PricingSessionState | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const isPaid = plan.tier === "paid"

  useEffect(() => {
    let cancelled = false
    void readPricingSession().then((state) => {
      if (!cancelled) setSession(state)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!session) {
    return <Skeleton className="h-9 w-full" />
  }

  if (session.kind === "error") {
    return (
      <div className="flex w-full flex-col gap-2">
        <Button className="w-full" disabled variant="outline">
          {isPaid ? t("ctaSubscribe") : t("ctaGetStarted")}
        </Button>
        <p className="min-h-5 text-sm text-destructive" role="alert">
          {t("errorSessionCheck")}
        </p>
      </div>
    )
  }

  const signedIn = session.kind !== "signed_out"

  async function onPaidClick() {
    setMessage(null)
    setPending(true)
    try {
      const result = await startPaidCheckoutFlow({
        locale,
        plan,
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
              returnTo: `${window.location.origin}/${locale}/pricing?plan=${encodeURIComponent(plan.planId)}`,
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
        onClick={() => void onPaidClick()}
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
  const router = useRouter()
  const pathname = usePathname()
  const started = useRef(false)
  const [message, setMessage] = useState<string | null>(null)
  const plan = plans.find((entry) => entry.planId === planId) ?? null

  useEffect(() => {
    const paidPlan = plan?.tier === "paid" ? plan : null
    if (!paidPlan || started.current) return
    const guard = readPricingResumeGuard(paidPlan.planId)
    if (guard === "completed") {
      router.replace(pathname, { scroll: false })
      return
    }
    started.current = true
    if (guard !== "pending-org") {
      writePricingResumeGuard(paidPlan.planId, "completed")
    }
    router.replace(pathname, { scroll: false })
    void startPaidCheckoutFlow({
      locale,
      plan: paidPlan,
      source: "resume",
    }).then((result) => {
      if (result.kind === "redirect") {
        window.location.assign(result.url)
        return
      }
      writePricingResumeGuard(paidPlan.planId, "completed")
      setMessage(t(result.key))
    })
  }, [locale, pathname, plan, router, t])

  if (!message) return null

  return (
    <p className="mx-auto max-w-5xl text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}
