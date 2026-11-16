"use client"

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
import type { StudioOnboardingStepId } from "@/shared/onboarding/studio-onboarding.config"
import {
  STUDIO_ONBOARDING_STEPS,
  studioOnboardingStepIndex,
} from "@/shared/onboarding/studio-onboarding.config"

const completedIndicator = (
  <CheckIcon
    strokeWidth={2.5}
    className="size-3 *:stroke-[2.5]"
    aria-hidden="true"
  />
)

export function StudioOnboardingStepper({
  currentStep,
  completedSteps,
}: {
  readonly currentStep: StudioOnboardingStepId
  readonly completedSteps: readonly StudioOnboardingStepId[]
}) {
  const t = useTranslations("ui")
  const currentIndex = studioOnboardingStepIndex(currentStep)
  const completed = new Set(completedSteps)
  const activeStep = currentIndex + 1

  return (
    <Stepper
      value={activeStep}
      orientation="vertical"
      indicators={{ completed: completedIndicator }}
      className="w-full"
    >
      <StepperNav className="flex w-full flex-col gap-0">
        {STUDIO_ONBOARDING_STEPS.map((step, index) => {
          const stepNumber = index + 1
          const isComplete = completed.has(step.id)
          const upcoming = index > currentIndex && !isComplete
          const isLast = index === STUDIO_ONBOARDING_STEPS.length - 1
          const label = t(step.labelKey)
          const description = t(step.descriptionKey)

          const indicatorClassName =
            "relative z-10 flex size-[26px] shrink-0 items-center justify-center border-2 border-border bg-background text-xs leading-none font-semibold tabular-nums text-muted-foreground [&>div]:inset-0 [&>div]:flex [&>div]:items-center [&>div]:justify-center data-[state=active]:border-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground"

          return (
            <StepperItem
              key={step.id}
              step={stepNumber}
              completed={isComplete}
              disabled={upcoming}
              className="relative w-full items-stretch group-data-[orientation=vertical]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:items-start group-data-[orientation=vertical]/stepper-nav:justify-start"
            >
              {!isLast ? (
                <StepperSeparator className="pointer-events-none absolute inset-y-0 top-[1.625rem] left-[13px] -order-1 !m-0 -translate-x-1/2 bg-border group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-1.625rem)] group-data-[orientation=vertical]/stepper-nav:w-px" />
              ) : null}
              <StepperTrigger
                render={!upcoming ? <Link href={step.path} /> : undefined}
                aria-current={step.id === currentStep ? "step" : undefined}
                tabIndex={upcoming ? -1 : undefined}
                className={cn(
                  "flex w-full min-w-0 flex-row items-start gap-3 rounded-none p-0 pb-12 text-start shadow-none focus-visible:ring-offset-0 disabled:pointer-events-none",
                  isLast && "pb-0"
                )}
              >
                <StepperIndicator className={indicatorClassName}>
                  {stepNumber}
                </StepperIndicator>
                <div className="mt-0.5 min-w-0 flex-1 space-y-0.5 px-2 text-left">
                  <StepperTitle
                    className={cn(
                      step.id === currentStep
                        ? "text-base font-semibold text-foreground"
                        : "text-[0.9375rem] font-medium text-muted-foreground"
                    )}
                  >
                    {label}
                  </StepperTitle>
                  <StepperDescription
                    className={cn(
                      "text-sm leading-normal",
                      upcoming
                        ? "text-muted-foreground/65"
                        : "text-muted-foreground"
                    )}
                  >
                    {description}
                  </StepperDescription>
                </div>
                {isComplete ? (
                  <span className="sr-only">
                    {t("onboardingStepCompletedA11y")}
                  </span>
                ) : null}
              </StepperTrigger>
            </StepperItem>
          )
        })}
      </StepperNav>
    </Stepper>
  )
}
