"use client"

import {
  organizationSlugFromName,
  useOrgActiveMemberRole,
  useOrgSessionActiveId,
} from "@modules/org"
import { OrgOrganizationSettings } from "@modules/org/account-screens"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { Input } from "@packages/ui/components/input"
import { Label } from "@packages/ui/components/label"
import { toastManager } from "@packages/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"
import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import {
  STUDIO_ORG_SLUG_MAX_LENGTH,
  STUDIO_ORG_SLUG_PATTERN,
} from "@/shared/org/studio-org.constants"
import {
  isReservedStudioOrgSlug,
  studioAbsolutePath,
  studioSettingsPath,
} from "@/shared/org/studio-org.paths"
import { studioOrgRoleAccess } from "@/shared/org/studio-org-access"

export function StudioGeneralSettings({
  currentSlug,
}: {
  readonly currentSlug: string
}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const { data: organization } = authClient.useActiveOrganization()
  const { role, isPending } = useOrgActiveMemberRole()
  const organizationId = useOrgSessionActiveId()
  const canEdit = studioOrgRoleAccess(role).canEditGeneral
  const [name, setName] = useState("")
  const [slug, setSlug] = useState(currentSlug)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (organization?.name) setName(organization.name)
    if (organization?.slug) setSlug(organization.slug)
  }, [organization?.name, organization?.slug])

  async function saveIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEdit || !organizationId || busy) return
    const trimmedName = name.trim()
    const trimmedSlug = slug.trim().toLowerCase()
    if (
      trimmedName.length < 2 ||
      !STUDIO_ORG_SLUG_PATTERN.test(trimmedSlug) ||
      trimmedSlug.length > STUDIO_ORG_SLUG_MAX_LENGTH ||
      isReservedStudioOrgSlug(trimmedSlug)
    ) {
      toastManager.add({ type: "error", title: t("organizationSlugInvalid") })
      return
    }
    setBusy(true)
    try {
      await toastManager.promise(
        (async () => {
          const result = await authClient.organization.update({
            organizationId,
            data: { name: trimmedName, slug: trimmedSlug },
          })
          if (result.error) {
            throw new Error(
              result.error.message || t("organizationSettingsSaveError")
            )
          }
          if (trimmedSlug !== currentSlug) {
            window.location.assign(
              studioAbsolutePath(
                locale,
                studioSettingsPath(trimmedSlug, "/general")
              )
            )
          }
        })(),
        {
          loading: t("organizationSettingsSaving"),
          success: t("organizationSettingsSaved"),
          error: (err: unknown) =>
            err instanceof Error
              ? err.message
              : t("organizationSettingsSaveError"),
        }
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <form className="flex max-w-lg flex-col gap-4" onSubmit={saveIdentity}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="org-name">{t("organizationName")}</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(event) => {
              const next = event.target.value
              setName(next)
              if (
                slug === currentSlug ||
                slug === organizationSlugFromName(name)
              ) {
                setSlug(organizationSlugFromName(next))
              }
            }}
            disabled={!canEdit || isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="org-slug">{t("organizationSlug")}</Label>
          <Input
            id="org-slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value.toLowerCase())}
            disabled={!canEdit || isPending}
          />
        </div>
        {canEdit ? (
          <div>
            <Button type="submit" disabled={busy}>
              {busy ? t("organizationSettingsSaving") : t("submit")}
            </Button>
          </div>
        ) : null}
      </form>
      <OrgOrganizationSettings />
    </div>
  )
}
