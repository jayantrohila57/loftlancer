"use client"

import type { FieldValues, Path } from "react-hook-form"
import type { TextFieldProps } from "../../../types/form.field.types"
import { FieldText } from "./form.field.input-text"

type EmailInputProps<
  TValues extends FieldValues,
  TName extends Path<TValues>,
> = Omit<TextFieldProps<TValues, TName>, "type" | "inputType">

export function FieldEmail<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>(props: EmailInputProps<TValues, TName>) {
  return <FieldText {...props} type="email" />
}
