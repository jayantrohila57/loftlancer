"use client"

import type { FieldAsyncStatus } from "@features/form"
import { FormKit } from "@features/form"
import { withClientRetry } from "@modules/auth"
import { organizationSlugFromName } from "@modules/org"
import { authClient } from "@packages/better-auth/client"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import type { z } from "zod"
import {
  STUDIO_ORG_SLUG_MAX_LENGTH,
  STUDIO_ORG_SLUG_PATTERN,
} from "@/shared/org/studio-org.constants"
import { isReservedStudioOrgSlug } from "@/shared/org/studio-org.paths"
import type { studioOnboardingOrganizationSchema } from "@/shared/onboarding/studio-onboarding-organization-schema.client"

type StudioOnboardingOrganizationValues = z.infer<
  ReturnType<typeof studioOnboardingOrganizationSchema>
>

const SLUG_TAKEN_CODES = new Set([
  "ORGANIZATION_ALREADY_EXISTS",
  "ORGANIZATION_SLUG_ALREADY_TAKEN",
])

type SlugApiStatus = "idle" | "checking" | "available" | "taken" | "error"

function isStudioOnboardingSlugFormatValid(slug: string): boolean {
  const trimmed = slug.trim().toLowerCase()
  if (!trimmed) return false
  if (trimmed.length > STUDIO_ORG_SLUG_MAX_LENGTH) return false
  if (!STUDIO_ORG_SLUG_PATTERN.test(trimmed)) return false
  if (isReservedStudioOrgSlug(trimmed)) return false
  return true
}

function slugAvailabilityIconStatus(input: {
  readonly slug: string
  readonly apiStatus: SlugApiStatus
  readonly hasFormatError: boolean
}): FieldAsyncStatus {
  const trimmed = input.slug.trim()
  if (!trimmed) return "idle"
  if (input.hasFormatError || input.apiStatus === "taken") return "invalid"
  if (input.apiStatus === "checking") return "checking"
  if (input.apiStatus === "available") return "valid"
  return "idle"
}

export function StudioOnboardingSlugAutoFill() {
  const { control, getValues, setValue } =
    useFormContext<StudioOnboardingOrganizationValues>()
  const name = useWatch({ control, name: "name" })
  const lastAutoSlugRef = useRef("")

  useEffect(() => {
    const currentSlug = getValues("slug") ?? ""
    const wasAuto =
      currentSlug.length === 0 || currentSlug === lastAutoSlugRef.current
    if (!wasAuto) return
    const next = organizationSlugFromName(String(name ?? ""))
    lastAutoSlugRef.current = next
    if (currentSlug !== next) {
      setValue("slug", next, { shouldValidate: next.length > 0 })
    }
  }, [name, getValues, setValue])

  return null
}

export function StudioOnboardingSlugPreview() {
  const t = useTranslations("ui")
  const { control } = useFormContext<StudioOnboardingOrganizationValues>()
  const slug = useWatch({ control, name: "slug" })
  const value = String(slug ?? "").trim()
  if (!value) return null
  return (
    <p className="text-muted-foreground text-sm" aria-live="polite">
      {t("organizationSlugPreview", { slug: value })}
    </p>
  )
}

export function StudioOnboardingSlugField() {
  const t = useTranslations("ui")
  const { control, setError, clearErrors, trigger } =
    useFormContext<StudioOnboardingOrganizationValues>()
  const slug = useWatch({ control, name: "slug" })
  const slugValue = String(slug ?? "")
  const trimmedSlug = slugValue.trim().toLowerCase()
  const [apiStatus, setApiStatus] = useState<SlugApiStatus>("idle")
  const requestIdRef = useRef(0)
  const hadAvailabilityErrorRef = useRef(false)

  const passesClientRules = isStudioOnboardingSlugFormatValid(slugValue)
  const hasFormatError = trimmedSlug.length > 0 && !passesClientRules

  const asyncStatus = slugAvailabilityIconStatus({
    slug: slugValue,
    apiStatus,
    hasFormatError,
  })

  const asyncStatusLabels = {
    checking: t("checkingOrganizationSlug"),
    valid: t("organizationSlugAvailable"),
    invalid: t("organizationSlugUnavailable"),
  }

  function clearSlugAvailabilityError() {
    if (!hadAvailabilityErrorRef.current) return
    hadAvailabilityErrorRef.current = false
    clearErrors("slug")
    void trigger("slug")
  }

  useEffect(() => {
    if (!trimmedSlug || !passesClientRules) {
      setApiStatus("idle")
      clearSlugAvailabilityError()
      return
    }

    setApiStatus("checking")
    const requestId = ++requestIdRef.current
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = (await withClientRetry(() =>
            authClient.organization.checkSlug({ slug: trimmedSlug })
          )) as Awaited<ReturnType<typeof authClient.organization.checkSlug>>
          if (requestId !== requestIdRef.current) return

          if (result.error) {
            const code = result.error.code
            const message = result.error.message?.trim()
            const taken =
              (code && SLUG_TAKEN_CODES.has(code)) ||
              message === "Organization slug already taken" ||
              message === "Organization already exists"
            if (taken) {
              setApiStatus("taken")
              hadAvailabilityErrorRef.current = true
              setError(
                "slug",
                {
                  type: "slugAvailability",
                  message: t("organizationSlugAlreadyTaken"),
                },
                { shouldFocus: false }
              )
              return
            }
            setApiStatus("error")
            return
          }

          setApiStatus("available")
          clearSlugAvailabilityError()
        } catch {
          if (requestId !== requestIdRef.current) return
          setApiStatus("error")
        }
      })()
    }, 400)

    return () => {
      window.clearTimeout(timer)
    }
  }, [clearErrors, passesClientRules, setError, t, trigger, trimmedSlug])

  return (
    <FormKit.Field
      type="text"
      name="slug"
      label={t("organizationSlug")}
      description={t("organizationSlugFieldDescription")}
      required
      asyncStatus={asyncStatus}
      asyncStatusLabels={asyncStatusLabels}
    />
  )
}