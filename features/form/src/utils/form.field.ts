import type { ReactNode } from "react"

/** Build associations only for descriptions and errors that are rendered. */
export function getFieldDescribedBy(
  id: string,
  description: ReactNode,
  error: unknown,
  extraId?: string
): string | undefined {
  return (
    [description && `${id}-description`, error && `${id}-error`, extraId]
      .filter(Boolean)
      .join(" ") || undefined
  )
}

export function getPasswordStrength(value: string): string {
  if (!value) return "Enter a password"
  const categories = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(
    (pattern) => pattern.test(value)
  ).length
  if (value.length >= 12 && categories >= 3) return "Strength: strong"
  if (value.length >= 8 && categories >= 2) return "Strength: moderate"
  return "Strength: weak"
}
