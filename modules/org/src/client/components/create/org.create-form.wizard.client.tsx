"use client"

import type { ComboboxOption } from "@features/form"
import {
  Collapsible,
  CollapsibleContent,
} from "@packages/ui/components/collapsible"
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from "@packages/ui/components/reui/stepper"
import { cn } from "@packages/ui/lib/utils"
import { CheckIcon, ChevronRightIcon, CircleDashedIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useMemo } from "react"
import type { FieldPath, FormState } from "react-hook-form"
import { useFormContext, useFormState, useWatch } from "react-hook-form"
import type { z } from "zod"

import type { createOrganizationFormSchema } from "./org.create-form.schema.client"
import type {
  OrgCreateWizardNav,
  OrgCreateWizardNavTask,
  OrgCreateWizardReviewTask,
} from "./org.create-form.wizard-nav.client"
import {
  ORG_CREATE_WIZARD_NAV_TASKS,
  orgCreateWizardTaskLabelKey,
} from "./org.create-form.wizard-nav.client"
import { OrgCreateWizardSections } from "./org.create-form.wizard-sections.client"

type OrganizationFormValues = z.infer<
  ReturnType<typeof createOrganizationFormSchema>
>

type OrganizationTypeOption = {
  readonly value: "freelancer" | "studio" | "agency" | "company"
  readonly label: string
  readonly description: string
}

function readFieldValue(
  values: OrganizationFormValues,
  name: FieldPath<OrganizationFormValues>
) {
  const parts = String(name).split(".")
  let current: unknown = values
  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

function isReviewNavTask(
  task: OrgCreateWizardNavTask
): task is OrgCreateWizardReviewTask {
  return String(task).startsWith("review:")
}

function isFieldComplete(
  name: OrgCreateWizardNavTask,
  values: OrganizationFormValues,
  getFieldState: ReturnType<
    typeof useFormContext<OrganizationFormValues>
  >["getFieldState"],
  formState: FormState<OrganizationFormValues>
): boolean {
  if (isReviewNavTask(name)) return true
  const { error, invalid } = getFieldState(
    name as FieldPath<OrganizationFormValues>,
    formState
  )
  if (error ?? invalid) return false
  if (
    name === "basics.description" ||
    name === "logo" ||
    name === "basics.logoUrl"
  ) {
    return true
  }
  const raw = readFieldValue(values, name as FieldPath<OrganizationFormValues>)
  if (typeof raw === "string") return raw.trim().length > 0
  return raw != null
}

function taskProgress(
  taskNames: readonly OrgCreateWizardNavTask[],
  values: OrganizationFormValues,
  getFieldState: ReturnType<
    typeof useFormContext<OrganizationFormValues>
  >["getFieldState"],
  formState: FormState<OrganizationFormValues>
): number {
  for (let index = 0; index < taskNames.length; index++) {
    const name = taskNames[index]
    if (name && !isFieldComplete(name, values, getFieldState, formState)) {
      return index + 1
    }
  }
  return taskNames.length + 1
}

const taskIndicators = {
  completed: (
    <CheckIcon
      strokeWidth={2.88}
      className="size-2.5 *:stroke-[2.88]"
      aria-hidden="true"
    />
  ),
  inactive: <CircleDashedIcon className="size-3" aria-hidden="true" />,
}

const phaseCompletedIndicator = (
  <CheckIcon strokeWidth={2.5} className="size-3" aria-hidden="true" />
)

const PHASE_LABEL_KEYS = [
  "organizationCreateSectionBasics",
  "organizationCreateSectionBusiness",
  "organizationCreateSectionContact",
  "organizationCreateSectionLocation",
  "organizationCreateSectionLegal",
  "organizationCreateSectionBranding",
  "organizationCreateSectionWorkspace",
  "organizationCreateSectionTeam",
  "organizationCreateSectionReview",
] as const

export function OrgCreateFormWizard({
  compact = false,
  nav,
  organizationTypeOptions,
  countryOptions,
  currencyOptions,
}: {
  readonly compact?: boolean
  readonly nav: OrgCreateWizardNav
  readonly organizationTypeOptions: readonly OrganizationTypeOption[]
  readonly countryOptions: ComboboxOption[]
  readonly currencyOptions: ComboboxOption[]
}) {
  const t = useTranslations("ui")
  const id = useId()
  const { wizardStep, navOpen, selectPhase } = nav

  const { control, getFieldState } = useFormContext<OrganizationFormValues>()
  const formState = useFormState({ control })
  const values = useWatch({ control }) as OrganizationFormValues

  const phases = useMemo(
    () =>
      PHASE_LABEL_KEYS.map((titleKey, index) => ({
        title: t(titleKey),
        tasks: ORG_CREATE_WIZARD_NAV_TASKS[index] ?? [],
      })),
    [t]
  )

  return (
    <Stepper
      value={wizardStep}
      onValueChange={selectPhase}
      orientation="vertical"
      indicators={{ completed: phaseCompletedIndicator }}
      className={cn(
        "@container w-full",
        compact && "flex h-full min-h-0 flex-1 flex-col"
      )}
      aria-label={t("organizationCreateWizardAriaLabel")}
    >
      <div
        className={cn(
          "flex flex-col gap-6 @md:flex-row @md:items-start",
          compact &&
            "h-full min-h-0 flex-1 overflow-hidden @md:items-stretch @md:gap-4"
        )}
      >
        <StepperNav
          className={cn(
            "w-full max-w-64 shrink-0 gap-1 [&>[data-slot=stepper-item]]:w-full [&>[data-slot=stepper-item]]:flex-none",
            compact &&
              "min-h-0 shrink-0 self-stretch @md:h-full @md:overflow-hidden @md:border-e @md:border-border @md:pe-4"
          )}
        >
          {phases.map((phase, index) => {
            const step = index + 1
            const expanded = navOpen && step === wizardStep
            const tasksId = `${id}-tasks-${step}`
            const progress =
              step === wizardStep
                ? taskProgress(phase.tasks, values, getFieldState, formState)
                : step < wizardStep
                  ? phase.tasks.length + 1
                  : 0

            return (
              <StepperItem
                key={phase.title}
                step={step}
                disabled={step > wizardStep}
                className="w-full items-stretch"
              >
                <Collapsible open={expanded}>
                  <div className="w-full overflow-hidden px-2 py-0.5">
                    <StepperTrigger
                      tabIndex={step > wizardStep ? -1 : undefined}
                      id={`${id}-phase-${step}`}
                      aria-controls={expanded ? tasksId : undefined}
                      aria-expanded={expanded}
                      onKeyUp={(event) => {
                        if (event.key === " ") event.preventDefault()
                      }}
                      className="relative grid min-h-7 w-full min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md py-0 text-start after:absolute after:-inset-1"
                    >
                      <StepperIndicator className="size-4.5 shrink-0 border border-border bg-muted/50 text-[10px] leading-none font-medium text-muted-foreground data-[state=active]:border-ring data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=completed]:border-success data-[state=completed]:bg-success/10 data-[state=completed]:text-success">
                        {step}
                      </StepperIndicator>
                      <StepperTitle className="min-w-0 truncate text-start text-xs leading-snug font-medium data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
                        {phase.title}
                      </StepperTitle>
                      {step < wizardStep ? (
                        <span className="sr-only">
                          {t("organizationCreateWizardPhaseCompletedAssist")}
                        </span>
                      ) : null}
                      <ChevronRightIcon
                        className={cn(
                          "col-start-3 size-3.5 shrink-0 justify-self-end transition-transform",
                          expanded
                            ? "rotate-90 text-foreground"
                            : "text-ring rtl:rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </StepperTrigger>

                    {phase.tasks.length > 0 ? (
                      <CollapsibleContent
                        id={tasksId}
                        className="-mx-2 h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
                      >
                        <Stepper
                          value={progress}
                          orientation="vertical"
                          indicators={taskIndicators}
                          className="mt-2"
                          aria-label={t(
                            "organizationCreateWizardTasksAriaLabel",
                            { phase: phase.title }
                          )}
                        >
                          <StepperNav className="w-full gap-0 [&>[data-slot=stepper-item]]:w-full [&>[data-slot=stepper-item]]:flex-none">
                            {phase.tasks.map((taskName, taskIndex) => {
                              const taskStep = taskIndex + 1
                              const complete = isFieldComplete(
                                taskName,
                                values,
                                getFieldState,
                                formState
                              )
                              const active = taskStep === progress

                              const taskLabelKey =
                                orgCreateWizardTaskLabelKey(taskName)
                              const taskLabel = t(taskLabelKey)

                              return (
                                <StepperItem
                                  key={taskName}
                                  step={taskStep}
                                  loading={active && !complete}
                                  className="w-full items-stretch"
                                >
                                  <div
                                    aria-current={active ? "step" : undefined}
                                    className={cn(
                                      "relative flex min-h-7 w-full min-w-0 items-center gap-2 rounded-none py-0 ps-7.5 pe-2 text-start before:absolute before:inset-y-1.25 before:start-0 before:w-0.75 before:rounded-e-full",
                                      active &&
                                        !complete &&
                                        "bg-background before:bg-blue-500"
                                    )}
                                  >
                                    <StepperIndicator className="size-3 shrink-0 bg-transparent text-ring/60 data-[state=active]:bg-transparent data-[state=completed]:border data-[state=completed]:border-success data-[state=completed]:bg-success/10 data-[state=completed]:text-success" />
                                    <StepperTitle className="line-clamp-2 min-w-0 flex-1 text-[11px] leading-4 font-normal data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
                                      {taskLabel}
                                    </StepperTitle>
                                  </div>
                                </StepperItem>
                              )
                            })}
                          </StepperNav>
                        </Stepper>
                      </CollapsibleContent>
                    ) : null}
                  </div>
                </Collapsible>
              </StepperItem>
            )
          })}
        </StepperNav>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-4 px-2 text-start @md:px-0 @md:pt-2",
            compact && "min-h-0 overflow-y-auto overscroll-contain @md:pt-0"
          )}
        >
          <StepperPanel className={cn(compact && "w-full")}>
            {phases.map((_, index) => (
              <StepperContent key={PHASE_LABEL_KEYS[index]} value={index + 1}>
                <OrgCreateWizardSections
                  step={index + 1}
                  organizationTypeOptions={organizationTypeOptions}
                  countryOptions={countryOptions}
                  currencyOptions={currencyOptions}
                />
              </StepperContent>
            ))}
          </StepperPanel>
        </div>
      </div>
    </Stepper>
  )
}
