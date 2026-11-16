"use client"

import { Button } from "@packages/ui/components/button"
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@packages/ui/components/reui/stepper"
import { cn } from "@packages/ui/lib/utils"
import { CheckIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n/studio.i18n"

const steps = [
  {
    id: "organization",
    href: "/onboarding/organization",
    labelKey: "onboardingOrganizationStep",
    descriptionKey: "onboardingOrganizationStepDescription",
  },
  {
    id: "plan",
    href: "/onboarding/plan",
    labelKey: "onboardingPlanStep",
    descriptionKey: "onboardingPlanStepDescription",
  },
  {
    id: "invite",
    href: "/onboarding/invite",
    labelKey: "onboardingInviteStep",
    descriptionKey: "onboardingInviteStepDescription",
  },
] as const

export type StudioOnboardingStepId = (typeof steps)[number]["id"]

const completedIndicator = (
  <CheckIcon
    strokeWidth={2.5}
    className="size-3 *:stroke-[2.5]"
    aria-hidden="true"
  />
)

export function StudioOnboardingSteps({
  current,
  orientation = "horizontal",
}: {
  readonly current: StudioOnboardingStepId
  readonly orientation?: "horizontal" | "vertical"
}) {
  const t = useTranslations("ui")
  const currentIndex = steps.findIndex((step) => step.id === current)
  const activeStep = currentIndex + 1

  return (
    <Stepper
      value={activeStep}
      orientation={orientation}
      indicators={{ completed: completedIndicator }}
      className="w-full"
    >
      <StepperNav
        className={cn(
          "w-full",
          orientation === "vertical" ? "flex-col gap-0" : "flex-row flex-wrap gap-6"
        )}
      >
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const upcoming = index > currentIndex
          const complete = index < currentIndex
          const isLast = index === steps.length - 1
          const label = t(step.labelKey)
          const description = t(step.descriptionKey)

          const indicatorClassName =
            "relative z-10 flex size-[26px] shrink-0 items-center justify-center border-2 border-border bg-background text-xs leading-none font-semibold tabular-nums text-muted-foreground [&>div]:inset-0 [&>div]:flex [&>div]:items-center [&>div]:justify-center data-[state=active]:border-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground"

          return (
            <StepperItem
              key={step.id}
              step={stepNumber}
              disabled={upcoming}
              className={cn(
                "w-full items-stretch",
                orientation === "vertical" &&
                  "relative group-data-[orientation=vertical]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:items-start group-data-[orientation=vertical]/stepper-nav:justify-start"
              )}
            >
              {orientation === "vertical" && !isLast ? (
                <StepperSeparator className="-order-1 pointer-events-none absolute inset-y-0 top-[1.625rem] left-[13px] !m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-1.625rem)] group-data-[orientation=vertical]/stepper-nav:w-px bg-border" />
              ) : null}
              <StepperTrigger
                render={!upcoming ? <Link href={step.href} /> : undefined}
                aria-current={step.id === current ? "step" : undefined}
                tabIndex={upcoming ? -1 : undefined}
                className={cn(
                  "flex w-full min-w-0 flex-row items-start gap-3 rounded-none p-0 text-start shadow-none focus-visible:ring-offset-0 disabled:pointer-events-none",
                  orientation === "vertical" && !isLast && "pb-12"
                )}
              >
                <StepperIndicator className={indicatorClassName}>
                  {stepNumber}
                </StepperIndicator>
                <div
                  className={cn(
                    "min-w-0 flex-1 text-left",
                    orientation === "vertical"
                      ? "mt-0.5 space-y-0.5 px-2"
                      : "flex flex-col gap-1 pt-0.5"
                  )}
                >
                  <StepperTitle
                    className={cn(
                      orientation === "vertical"
                        ? cn(
                            step.id === current
                              ? "text-base"
                              : "text-[0.9375rem]",
                            "leading-snug"
                          )
                        : "text-sm leading-snug",
                      step.id === current
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground"
                    )}
                  >
                    {label}
                  </StepperTitle>
                  <StepperDescription
                    className={cn(
                      orientation === "vertical"
                        ? "text-sm leading-normal"
                        : "text-sm leading-snug",
                      upcoming
                        ? "text-muted-foreground/65"
                        : "text-muted-foreground"
                    )}
                  >
                    {description}
                  </StepperDescription>
                </div>
                {complete ? (
                  <span className="sr-only">, completed</span>
                ) : null}
              </StepperTrigger>
            </StepperItem>
          )
        })}
      </StepperNav>
    </Stepper>
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