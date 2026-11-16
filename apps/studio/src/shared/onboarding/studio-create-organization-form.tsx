"use client"

import { withClientRetry } from "@modules/auth"
import { formatOrgClientError, organizationSlugFromName } from "@modules/org"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { Input } from "@packages/ui/components/input"
import { Label } from "@packages/ui/components/label"
import { toastManager } from "@packages/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"
import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import {
  STUDIO_ORG_SLUG_MAX_LENGTH,
  STUDIO_ORG_SLUG_PATTERN,
} from "@/shared/org/studio-org.constants"
import {
  isReservedStudioOrgSlug,
  studioAbsolutePath,
} from "@/shared/org/studio-org.paths"

function slugify(name: string, currentSlug: string, lastAuto: string) {
  const next = organizationSlugFromName(name)
  const wasAuto = currentSlug.length === 0 || currentSlug === lastAuto
  return wasAuto ? next : currentSlug
}

async function resumeProvisioning() {
  try {
    await withClientRetry(async () => {
      const result = await securityRpc.security.org.provisioning.resume()
      if (result.status !== "success") {
        throw new Error(result.message)
      }
      return result.data
    })
  } catch {
    // Provisioning can be resumed later from billing or the create gate.
  }
}

export function StudioCreateOrganizationForm({
  nextPath,
}: {
  readonly nextPath: "plan" | "org-home"
}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [autoSlug, setAutoSlug] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const previewSlug = useMemo(() => slug.trim(), [slug])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const trimmedName = name.trim()
    const trimmedSlug = slug.trim().toLowerCase()
    if (trimmedName.length < 2) {
      toastManager.add({
        type: "error",
        title: t("organizationNameRequired"),
      })
      return
    }
    if (
      !STUDIO_ORG_SLUG_PATTERN.test(trimmedSlug) ||
      trimmedSlug.length > STUDIO_ORG_SLUG_MAX_LENGTH ||
      isReservedStudioOrgSlug(trimmedSlug)
    ) {
      toastManager.add({
        type: "error",
        title: t("organizationSlugInvalid"),
      })
      return
    }
    setSubmitting(true)
    try {
      await toastManager.promise(
        (async () => {
          const response = await authClient.organization.create({
            name: trimmedName,
            slug: trimmedSlug,
          })
          if (response.error) {
            throw new Error(
              formatOrgClientError(response.error, {
                fallback: t("couldNotCreateOrganization"),
                limitMessage: t("organizationCreateLimitReached"),
                slugTakenMessage: t("organizationSlugAlreadyTaken"),
              })
            )
          }
          const created = response.data as
            | { id?: string; slug?: string }
            | undefined
          if (created?.id) {
            const activated = await authClient.organization.setActive({
              organizationId: created.id,
            })
            if (activated.error) {
              throw new Error(
                activated.error.message?.trim() ||
                  t("couldNotSwitchOrganization")
              )
            }
          }
          await resumeProvisioning()
          const createdSlug = created?.slug ?? trimmedSlug
          const dest =
            nextPath === "plan"
              ? studioAbsolutePath(locale, "/onboarding/plan")
              : studioAbsolutePath(locale, `/${createdSlug}`)
          window.location.assign(dest)
        })(),
        {
          loading: t("creatingOrganization"),
          success: t("organizationCreated"),
          error: (error: unknown) =>
            error instanceof Error
              ? error.message
              : t("couldNotCreateOrganization"),
        }
      )
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <form className="flex max-w-lg flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="organization-name">{t("organizationName")}</Label>
        <Input
          id="organization-name"
          name="name"
          autoComplete="organization"
          value={name}
          onChange={(event) => {
            const nextName = event.target.value
            const nextSlug = slugify(nextName, slug, autoSlug)
            setName(nextName)
            setSlug(nextSlug)
            setAutoSlug(organizationSlugFromName(nextName))
          }}
          required
          minLength={2}
        />
        <p className="text-sm text-muted-foreground">
          {t("organizationNameFieldDescription")}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="organization-slug">{t("organizationSlug")}</Label>
        <Input
          id="organization-slug"
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value.toLowerCase())}
          required
        />
        {previewSlug ? (
          <p className="text-sm text-muted-foreground">
            {t("organizationSlugPreview", { slug: previewSlug })}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("organizationSlugFieldDescription")}
          </p>
        )}
      </div>
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? t("creatingOrganization") : t("createOrganization")}
        </Button>
      </div>
    </form>
  )
}
