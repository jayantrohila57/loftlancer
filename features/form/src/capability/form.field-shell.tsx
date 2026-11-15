"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@packages/ui/components/field"
import { Skeleton } from "@packages/ui/components/skeleton"
import type { ReactNode } from "react"

type FieldShellProps = {
  id: string
  label?: ReactNode
  description?: ReactNode
  required?: boolean
  disabled?: boolean
  loading?: boolean
  multiline?: boolean
  error?: string
  children: ReactNode
}

/** Shared label, loading state, hint and error for form controls. */
export function FieldShell({
  id,
  label,
  description,
  required = false,
  disabled = false,
  loading = false,
  multiline = false,
  error,
  children,
}: FieldShellProps) {
  return (
    <Field
      className="w-full"
      invalid={Boolean(error)}
      disabled={disabled}
      data-field-name={id}
      aria-busy={loading || undefined}
    >
      {label ? (
        <FieldLabel htmlFor={id}>
          {label}
          {required ? (
            <span aria-hidden="true" className="text-destructive">
              {"*"}
            </span>
          ) : null}
        </FieldLabel>
      ) : null}
      {loading ? (
        multiline ? (
          <Skeleton className="min-h-20 w-full rounded-lg" />
        ) : (
          <Skeleton className="h-9 w-full rounded-lg sm:h-8" />
        )
      ) : (
        children
      )}
      {description ? (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      ) : null}
      {error ? (
        <FieldError id={`${id}-error`} match={true}>
          {error}
        </FieldError>
      ) : null}
    </Field>
  )
}
