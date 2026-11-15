"use client"

import { authClient } from "@packages/better-auth/client"
import { useQueryClient } from "@packages/react-query"
import { clientEnv } from "@packages/t3-env/client"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { toastManager } from "@packages/ui/components/toast"
import { Building2, Check, Plus, Settings2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { readActiveOrganizationId } from "../../../utils/org.session"
import type { OrgListedOrganization } from "../../hooks/org.hook.list-organizations"
import { useOrgListOrganizations } from "../../hooks/org.hook.list-organizations"
import { switchActiveOrganization } from "../../utils/org.switch-active.client"
import { useOrgCreateSheet } from "../create/org.create-sheet.client"

export function OrgList() {
  const t = useTranslations("ui")
  const openCreate = useOrgCreateSheet()
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [switching, setSwitching] = useState<string | null>(null)
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { data: organizations, isPending, error } = useOrgListOrganizations()
  const activeId = readActiveOrganizationId(session)
  const base = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
  const settingsUrl = `${base}/${locale}/account/organization`

  async function selectOrganization(id: string) {
    setSwitching(id)
    try {
      await switchActiveOrganization({
        organizationId: id,
        queryClient,
        switchErrorMessage: t("couldNotSwitchOrganization"),
      })
      window.location.assign(settingsUrl)
    } catch (error) {
      toastManager.add({
        title:
          error instanceof Error
            ? error.message
            : t("couldNotSwitchOrganization"),
        type: "error",
      })
      setSwitching(null)
    }
  }

  if (sessionPending || isPending) return <Skeleton className="h-16 w-full" />
  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {t("organizationsLoadError")}
        </p>
      ) : null}
      {!error && !organizations?.length ? (
        <p className="text-sm text-muted-foreground">
          {t("organizationEmptyState")}
        </p>
      ) : null}
      {organizations?.length ? (
        <div className="overflow-hidden rounded-xl border border-border">
          {organizations.map((org: OrgListedOrganization) => (
            <div
              key={org.id}
              className="flex items-center gap-3 border-b border-border p-4 last:border-b-0"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Building2 aria-hidden="true" className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{org.name}</p>
                {org.slug ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {org.slug}
                  </p>
                ) : null}
              </div>
              {activeId === org.id ? (
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Check aria-hidden="true" className="size-4" />
                  {t("activeOrganization")}
                </span>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                disabled={switching !== null}
                loading={switching === org.id}
                onClick={() => {
                  selectOrganization(org.id).catch(() => setSwitching(null))
                }}
              >
                <Settings2 aria-hidden="true" />
                {t("organizationSettings")}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      <Button onClick={openCreate} variant="secondary" className="self-start">
        <Plus />
        {t("createOrganization")}
      </Button>
    </div>
  )
}
