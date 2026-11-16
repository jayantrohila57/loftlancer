"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@packages/ui/components/button"
import { cn } from "@packages/ui/lib/utils"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
} from "react"
import {
  FormKitFormIdProvider,
  useFormKitFormId,
} from "./form.form-id.context"
import type { FieldValues, Path } from "react-hook-form"
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from "react-hook-form"
import { formValidationDefaults } from "../config/form.config"
import type {
  FormKitActionsProps,
  FormKitProps,
  FormKitSectionProps,
} from "../types/form.form-kit.types"
import { mapUnknownServerError } from "../utils/form.server-errors"
import { applyServerErrors } from "./form.errors"
import { FormField } from "./form.fields"

function flattenFormKitSlots(children: ReactNode): ReactNode[] {
  const slots: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      (child.type === Fragment || child.type === FormKitGroup)
    ) {
      slots.push(...flattenFormKitSlots(child.props.children))
      return
    }
    slots.push(child)
  })
  return slots
}

/** Transparent wrapper so multiple fields and actions can share one FormKit parent. */
function FormKitGroup({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/** Owns validation and submission; fields and actions share its form context. */
function FormKitRoot<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
>({
  schema,
  defaultValues,
  onSubmit,
  children,
  variant = "card",
  fillViewport = false,
  formId: formIdProp,
}: FormKitProps<TInput, TOutput>) {
  const generatedFormId = useId()
  const formId = formIdProp ?? generatedFormId
  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues,
    ...formValidationDefaults,
  })
  const firstServerError = useRef<Path<TInput> | undefined>(undefined)
  const {
    setFocus,
    formState: { isSubmitting, errors },
  } = form
  useEffect(() => {
    if (!isSubmitting && firstServerError.current) {
      setFocus(firstServerError.current)
      firstServerError.current = undefined
    }
  }, [isSubmitting, setFocus])
  const slots = flattenFormKitSlots(children)
  const actions = slots.filter(
    (child) => isValidElement(child) && child.type === FormKitActions
  )
  const fields = slots.filter(
    (child) => !isValidElement(child) || child.type !== FormKitActions
  )
  const submit = form.handleSubmit(async (values) => {
    firstServerError.current = undefined
    form.clearErrors("root.server")
    try {
      await onSubmit(values)
    } catch (error) {
      firstServerError.current = applyServerErrors(
        form.setError,
        mapUnknownServerError(error)
      )
    }
  })
  const error = errors.root?.server?.message
  return (
    <FormProvider {...form}>
      <FormKitFormIdProvider formId={formId}>
        <form
          id={formId}
          onSubmit={submit}
          onReset={(event) => {
            event.preventDefault()
            form.reset()
          }}
          noValidate
          className={
            variant === "embedded"
              ? "flex min-h-0 w-full flex-col gap-4 [&_[data-slot=form-kit-actions]]:p-0"
              : "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
          }
        >
        {error ? (
          <p role="alert" className="px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div
          className={
            variant === "embedded"
              ? "flex w-full min-w-0 flex-col gap-4"
              : fillViewport
                ? "flex min-h-0 flex-1 flex-col overflow-hidden"
                : "min-h-0 flex-1 overflow-y-auto"
          }
        >
          <div
            className={
              variant === "embedded"
                ? "flex w-full min-w-0 flex-col gap-4"
                : fillViewport
                  ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
                  : "flex flex-col gap-4 p-4"
            }
          >
            {fields}
          </div>
        </div>
          {actions}
        </form>
      </FormKitFormIdProvider>
    </FormProvider>
  )
}

function FormKitSection({ title, description, children }: FormKitSectionProps) {
  return (
    <section className="grid w-full grid-cols-6 gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <div className="col-span-2 w-full space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="col-span-4 w-full min-w-0 self-start overflow-x-clip text-left">
        {children}
      </div>
    </section>
  )
}

function FormKitActions({ children, className }: FormKitActionsProps) {
  return (
    <div
      data-slot="form-kit-actions"
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-2 p-1",
        className
      )}
    >
      {children}
    </div>
  )
}

function FormKitSubmit() {
  const t = useTranslations("ui")
  const formId = useFormKitFormId()
  const { isSubmitting } = useFormState()
  return (
    <Button
      type="submit"
      form={formId}
      loading={isSubmitting}
      aria-label={isSubmitting ? t("submitting") : t("submit")}
    >
      {isSubmitting ? t("submitting") : t("submit")}
    </Button>
  )
}

function FormKitReset() {
  const t = useTranslations("ui")

  const {
    reset,
    formState: { isSubmitting },
  } = useFormContext()
  return (
    <Button
      type="button"
      variant="outline"
      disabled={isSubmitting}
      onClick={() => reset()}
    >
      {t("reset")}
    </Button>
  )
}

export const FormKit = Object.assign(FormKitRoot, {
  Field: FormField,
  Section: FormKitSection,
  Group: FormKitGroup,
  Actions: FormKitActions,
  Submit: FormKitSubmit,
  Reset: FormKitReset,
})
