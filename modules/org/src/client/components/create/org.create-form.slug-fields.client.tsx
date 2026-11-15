"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { useFormContext, useWatch } from "react-hook-form"

import { organizationSlugFromName } from "../../../utils/org.slug"

export function OrgCreateSlugAutoFill<TValues extends FieldValues>() {
  const { control, getValues, setValue } = useFormContext<TValues>()
  const name = useWatch({ control, name: "name" as Path<TValues> })
  const lastAutoSlugRef = useRef("")

  useEffect(() => {
    const currentSlug = String(getValues("slug" as Path<TValues>) ?? "")
    const wasAuto =
      currentSlug.length === 0 || currentSlug === lastAutoSlugRef.current
    if (!wasAuto) return
    const next = organizationSlugFromName(String(name ?? ""))
    lastAutoSlugRef.current = next
    if (currentSlug !== next) {
      setValue("slug" as Path<TValues>, next as never, {
        shouldValidate: next.length > 0,
      })
    }
  }, [name, getValues, setValue])

  return null
}

export function OrgCreateSlugPreview<TValues extends FieldValues>() {
  const t = useTranslations("ui")
  const { control } = useFormContext<TValues>()
  const slug = useWatch({ control, name: "slug" as Path<TValues> })
  const value = String(slug ?? "").trim()
  if (!value) return null
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      {t("organizationSlugPreview", { slug: value })}
    </p>
  )
}
