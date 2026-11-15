import type { ReactNode } from "react"
import type { DefaultValues, FieldValues } from "react-hook-form"
import type { z } from "zod"

export type FormKitProps<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
> = {
  schema: z.ZodType<TOutput, TInput>
  defaultValues: DefaultValues<TInput>
  onSubmit: (values: TOutput) => void | Promise<void>
  children: ReactNode
  variant?: "card" | "embedded"
  /** Card variant: lock body height and omit outer scroll (nested panes scroll). */
  fillViewport?: boolean
}
export type FormKitActionsProps = {
  children: ReactNode
  className?: string
}

export type FormKitSectionProps = {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
}
