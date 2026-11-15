"use client"

import type { FieldValues, Path } from "react-hook-form"
import type { TextFieldProps } from "../../../types/form.field.types"
import { FieldText } from "./form.field.input-text"

type TelInputProps<
  TValues extends FieldValues,
  TName extends Path<TValues>,
> = Omit<TextFieldProps<TValues, TName>, "type" | "inputType">

export function FieldTel<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>(props: TelInputProps<TValues, TName>) {
  return <FieldText {...props} type="tel" />
}
