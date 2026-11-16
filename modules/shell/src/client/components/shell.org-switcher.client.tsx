"use client"

import {
  readActiveOrganizationId,
  switchActiveOrganization,
  useOrgListOrganizations,
} from "@modules/org"
import { authClient } from "@packages/better-auth/client"
import { useQueryClient } from "@packages/react-query"
import { clientEnv } from "@packages/t3-env/client"
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@packages/ui/components/menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@packages/ui/components/sidebar"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { Building2, Check, ChevronsUpDown, List, Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

type ListedOrganization = {
  readonly id: string
  readonly name: string
}

export function ShellOrgSwitcher() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [switchingId, setSwitchingId] = useState<string | null>(null)
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: session, isPending: sessionPending } = authClient.useSession()
  const {
    data: organizations,
    isPending: listPending,
    error: listError,
    refetch: refetchOrganizations,
  } = useOrgListOrganizations()

  const activeOrganizationId = readActiveOrganizationId(session)
  const orgs: readonly ListedOrganization[] = organizations ?? []
  const activeOrg =
    orgs.find((org: ListedOrganization) => org.id === activeOrganizationId) ??
    null
  const studioBase =
    clientEnv.NEXT_PUBLIC_STUDIO_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/studio`
      : "http://localhost:3003")
  const createOrgHref = `${studioBase}/${locale}/organizations/new`
  const listOrgHref = `${studioBase}/${locale}/organizations`

  async function switchOrganization(organizationId: string) {
    if (switchingId) return
    setSwitchingId(organizationId)
    try {
      await toastManager.promise(
        (async () => {
          await switchActiveOrganization({
            organizationId,
            queryClient,
            switchErrorMessage: t("couldNotSwitchOrganization"),
          })
          await refetchOrganizations()
          window.location.reload()
        })(),
        {
          loading: t("switchingOrganization"),
          success: t("organizationSwitched"),
          error: (error: unknown) =>
            error instanceof Error
              ? error.message
              : t("couldNotSwitchOrganization"),
        }
      )
    } catch {
      // Toast reports the failure.
    } finally {
      setSwitchingId(null)
    }
  }

  if (!mounted || sessionPending || listPending) {
    return (
      <Skeleton
        aria-hidden="true"
        className="h-8 w-full rounded-lg group-data-[collapsible=icon]:size-8"
      />
    )
  }

  const triggerLabel =
    activeOrg?.name?.trim() ||
    (orgs.length === 0 ? t("noOrganization") : t("selectOrganization"))

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger
            render={
              <SidebarMenuButton
                aria-label={t("organizationSwitcher")}
                className="data-[state=open]:bg-sidebar-accent"
                tooltip={triggerLabel}
              />
            }
          >
            <Building2 aria-hidden="true" className="opacity-80" />
            <span className="min-w-0 truncate font-normal group-data-[collapsible=icon]:hidden">
              {triggerLabel}
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="ms-auto size-4 shrink-0 opacity-60 group-data-[collapsible=icon]:hidden"
            />
          </MenuTrigger>
          <MenuPopup align="start" className="w-64" side="right">
            {listError ? (
              <div
                className="px-2 py-1.5 text-xs text-destructive"
                role="alert"
              >
                {t("organizationsLoadError")}
              </div>
            ) : null}
            {!listError && orgs.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {t("organizationEmptyState")}
              </div>
            ) : null}
            {!listError && orgs.length > 0
              ? orgs.map((org: ListedOrganization) => {
                  const active = org.id === activeOrganizationId
                  const pending = switchingId === org.id
                  return (
                    <MenuItem
                      key={org.id}
                      closeOnClick={!pending}
                      disabled={pending || active}
                      onClick={() => {
                        if (!active) void switchOrganization(org.id)
                      }}
                    >
                      {pending ? (
                        <Spinner className="size-4" />
                      ) : active ? (
                        <Check className="size-4" />
                      ) : (
                        <Building2 className="size-4 opacity-70" />
                      )}
                      <span className="truncate">{org.name}</span>
                    </MenuItem>
                  )
                })
              : null}
            <MenuSeparator />
            <MenuLinkItem href={listOrgHref}>
              <List />
              {t("organizations")}
            </MenuLinkItem>
            <MenuLinkItem href={createOrgHref}>
              <Plus />
              {t("createOrganization")}
            </MenuLinkItem>
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
