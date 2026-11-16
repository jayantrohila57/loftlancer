"use client"

import { Button } from "@packages/ui/components/button"
import { cn } from "@packages/ui/lib/utils"
import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n/studio.i18n"

const steps = [
  {
    id: "organization",
    href: "/onboarding/organization",
    labelKey: "onboardingOrganizationStep",
  },
  { id: "plan", href: "/onboarding/plan", labelKey: "onboardingPlanStep" },
  {
    id: "invite",
    href: "/onboarding/invite",
    labelKey: "onboardingInviteStep",
  },
] as const

export function StudioOnboardingSteps({
  current,
}: {
  readonly current: (typeof steps)[number]["id"]
}) {
  const t = useTranslations("ui")
  const currentIndex = steps.findIndex((step) => step.id === current)

  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((step, index) => {
        const active = step.id === current
        const complete = index < currentIndex
        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-muted-foreground">
                {t("onboardingStepSeparator")}
              </span>
            ) : null}
            <Link
              href={step.href}
              className={cn(
                "rounded-md px-2 py-1",
                active && "bg-muted font-medium",
                complete && "text-muted-foreground"
              )}
            >
              {t("onboardingStepLabel", {
                step: index + 1,
                label: t(step.labelKey),
              })}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export function StudioOnboardingSkip({
  href,
  label,
}: {
  readonly href: string
  readonly label: string
}) {
  return <Button render={<Link href={href}>{label}</Link>} variant="outline" />
}
