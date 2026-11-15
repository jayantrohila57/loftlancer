"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import type { FieldValues } from "react-hook-form"
import { FormProvider, useForm } from "react-hook-form"
import { fieldValidationDefaults } from "../config/form.config"
import type { FieldKitProps } from "../types/form.field-kit.types"
import { FormField } from "./form.fields"

/** A field group without a form element. Supplying values makes it controlled. */
function FieldKitRoot<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
>({
  schema,
  values,
  defaultValues,
  onValuesChange,
  children,
}: FieldKitProps<TInput, TOutput>) {
  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    values,
    defaultValues,
    ...fieldValidationDefaults,
  })
  const onChange = useRef(onValuesChange)
  useEffect(() => {
    onChange.current = onValuesChange
  }, [onValuesChange])
  useEffect(() => {
    const subscription = form.watch((next) => {
      onChange.current?.(next)
    })
    return () => subscription.unsubscribe()
  }, [form])
  return (
    <FormProvider {...form}>
      <div className="flex w-full flex-col gap-4">{children}</div>
    </FormProvider>
  )
}
export const FieldKit = Object.assign(FieldKitRoot, { Field: FormField })
