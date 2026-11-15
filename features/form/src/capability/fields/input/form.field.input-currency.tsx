"use client"

import type { FieldValues, Path } from "react-hook-form"
import type { NumberInputFieldProps } from "../../../types/form.field.types"
import { FieldNumber } from "./form.field.input-number"

type CurrencyInputProps<
  TValues extends FieldValues,
  TName extends Path<TValues>,
> = Omit<NumberInputFieldProps<TValues, TName>, "type">

export function FieldCurrency<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>(props: CurrencyInputProps<TValues, TName>) {
  return <FieldNumber {...props} type="currency" />
}
