import type { ReactNode } from "react"
import type { DeepPartial, DefaultValues, FieldValues } from "react-hook-form"
import type { z } from "zod"

export type FieldKitProps<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
> = {
  schema: z.ZodType<TOutput, TInput>
  values?: TInput
  defaultValues?: DefaultValues<TInput>
  onValuesChange?: (values: DeepPartial<TInput>) => void
  children: ReactNode
}
