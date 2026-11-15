"use client"

import { FormKit } from "@features/form"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@packages/ui/components/sheet"
import { Skeleton } from "@packages/ui/components/skeleton"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

import { useStorageApi } from "../hooks/storage.api"

type GrantTarget =
  | {
      readonly kind: "folder"
      readonly id: string
      readonly displayName: string
    }
  | { readonly kind: "file"; readonly id: string; readonly displayName: string }

type OrganizationMember = {
  readonly userId: string
  readonly role: string
  readonly user?: {
    readonly email?: string | null
    readonly name?: string | null
  } | null
}

type StorageFilesGrantsSheetProps = {
  open: boolean
  organizationId: string
  target: GrantTarget | null
  onOpenChange: (open: boolean) => void
}

function GrantAddButton({ label }: { readonly label: string }) {
  const { formState } = useFormContext()
  return (
    <Button type="submit" loading={formState.isSubmitting}>
      {label}
    </Button>
  )
}

function memberLabel(member: OrganizationMember) {
  return (
    member.user?.name?.trim() || member.user?.email?.trim() || member.userId
  )
}

export function StorageFilesGrantsSheet({
  open,
  organizationId,
  target,
  onOpenChange,
}: StorageFilesGrantsSheetProps) {
  const t = useTranslations("ui")
  const grants = useStorageApi.useGrants(organizationId, open)
  const grantMutations = useStorageApi.useGrantMutations(organizationId)
  const { data: organization } = authClient.useActiveOrganization()
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const members = useMemo(
    () => (organization?.members ?? []) as OrganizationMember[],
    [organization?.members]
  )

  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        value: member.userId,
        label: memberLabel(member),
      })),
    [members]
  )

  const grantSchema = useMemo(
    () =>
      z.object({
        userId: z.string().min(1),
        includesDescendants: z.boolean().optional(),
      }),
    []
  )

  const scopedGrants = useMemo(() => {
    if (!target || !grants.data) return []
    return grants.data.grants.filter((grant) =>
      target.kind === "folder"
        ? grant.folderId === target.id
        : grant.itemId === target.id
    )
  }, [grants.data, target])

  async function createGrant(values: {
    userId: string
    includesDescendants?: boolean
  }) {
    if (!target) return
    try {
      await toastManager.promise(
        grantMutations.createGrant({
          userId: values.userId,
          folderId: target.kind === "folder" ? target.id : undefined,
          itemId: target.kind === "file" ? target.id : undefined,
          includesDescendants:
            target.kind === "folder"
              ? (values.includesDescendants ?? true)
              : undefined,
        }),
        {
          loading: t("storageGrantCreating"),
          success: t("storageGrantCreated"),
          error: t("storageGrantCreateError"),
        }
      )
    } catch {
      /* toast reports failure */
    }
  }

  async function revokeGrant(grantId: string) {
    setRevokingId(grantId)
    try {
      await toastManager.promise(grantMutations.revokeGrant(grantId), {
        loading: t("storageGrantRevoking"),
        success: t("storageGrantRevoked"),
        error: t("storageGrantRevokeError"),
      })
    } catch {
      /* toast reports failure */
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPopup side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("storageManageAccessTitle")}</SheetTitle>
          <SheetDescription>
            {target
              ? t("storageManageAccessDescription", {
                  name: target.displayName,
                })
              : t("storageManageAccessEmptyTarget")}
          </SheetDescription>
        </SheetHeader>
        <SheetPanel className="space-y-6">
          {grants.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t("storageGrantListHeading")}
              </p>
              {scopedGrants.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("storageGrantListEmpty")}
                </p>
              ) : (
                <ul className="divide-y rounded-md border text-sm">
                  {scopedGrants.map((grant) => {
                    const member = members.find(
                      (row) => row.userId === grant.userId
                    )
                    return (
                      <li
                        key={grant.id}
                        className="flex items-center justify-between gap-2 px-3 py-2"
                      >
                        <span className="min-w-0 truncate">
                          {member ? memberLabel(member) : grant.userId}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          loading={revokingId === grant.id}
                          disabled={revokingId === grant.id}
                          onClick={() => void revokeGrant(grant.id)}
                        >
                          {t("storageGrantRevoke")}
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}

          {target ? (
            <FormKit
              variant="embedded"
              schema={grantSchema}
              defaultValues={{ userId: "", includesDescendants: true }}
              onSubmit={createGrant}
            >
              <div className="space-y-4">
                <p className="text-sm font-medium">
                  {t("storageGrantAddHeading")}
                </p>
                <FormKit.Field
                  name="userId"
                  type="select"
                  label={t("storageGrantMemberLabel")}
                  options={memberOptions}
                  disabled={memberOptions.length === 0}
                />
                {target.kind === "folder" ? (
                  <FormKit.Field
                    name="includesDescendants"
                    type="checkbox"
                    label={t("storageGrantIncludesDescendants")}
                  />
                ) : null}
                <FormKit.Actions className="justify-start p-0">
                  <GrantAddButton label={t("storageGrantAdd")} />
                </FormKit.Actions>
              </div>
            </FormKit>
          ) : null}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  )
}
