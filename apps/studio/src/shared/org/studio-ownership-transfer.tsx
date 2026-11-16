"use client"

import { isOrganizationOwnerRole } from "@modules/org"
import { authClient } from "@packages/better-auth/client"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@packages/ui/components/alert-dialog"
import { Button } from "@packages/ui/components/button"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"

type MemberRow = {
  readonly id: string
  readonly role: string
  readonly userId: string
  readonly user?: {
    readonly name?: string | null
    readonly email?: string | null
  }
}

export function StudioOwnershipTransfer({
  isOwner,
}: {
  readonly isOwner: boolean
}) {
  const t = useTranslations("ui")
  const { data: session } = authClient.useSession()
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>("")
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await authClient.organization.getFullOrganization()
      if (result.error) {
        throw new Error(
          result.error.message || t("organizationMembersLoadError")
        )
      }
      const list = ((result.data?.members ?? []) as MemberRow[]) ?? []
      setMembers(list)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("organizationMembersLoadError")
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  if (!isOwner) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("transferOwnershipOwnerOnly")}
      </p>
    )
  }

  if (loading) return <Spinner className="size-5" />
  if (error) return <p className="text-sm text-destructive">{error}</p>

  const currentUserId = session?.user.id
  const currentOwner = members.find(
    (member) =>
      member.userId === currentUserId && isOrganizationOwnerRole(member.role)
  )
  const candidates = members.filter(
    (member) =>
      member.userId !== currentUserId && !isOrganizationOwnerRole(member.role)
  )
  const selected = candidates.find((member) => member.id === selectedId)

  async function transfer() {
    if (!selected || !currentOwner || busy) return
    setBusy(true)
    try {
      await toastManager.promise(
        (async () => {
          const promote = await authClient.organization.updateMemberRole({
            memberId: selected.id,
            role: "owner",
          })
          if (promote.error) {
            throw new Error(
              promote.error.message || t("couldNotTransferOwnership")
            )
          }
          const demote = await authClient.organization.updateMemberRole({
            memberId: currentOwner.id,
            role: "admin",
          })
          if (demote.error) {
            throw new Error(
              demote.error.message || t("couldNotTransferOwnership")
            )
          }
        })(),
        {
          loading: t("transferringOwnership"),
          success: t("ownershipTransferred"),
          error: (err: unknown) =>
            err instanceof Error ? err.message : t("couldNotTransferOwnership"),
        }
      )
      setConfirming(false)
      setSelectedId("")
      await load()
    } finally {
      setBusy(false)
    }
  }

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("transferOwnershipNoMembers")}
      </p>
    )
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span>{t("selectNewOwner")}</span>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">{t("select")}</option>
          {candidates.map((member) => (
            <option key={member.id} value={member.id}>
              {member.user?.name || member.user?.email || member.userId}
            </option>
          ))}
        </select>
      </label>
      <div>
        <Button
          type="button"
          disabled={!selectedId || busy}
          onClick={() => setConfirming(true)}
        >
          {t("transferOwnership")}
        </Button>
      </div>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("transferOwnership")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("transferOwnershipConfirm", {
                name:
                  selected?.user?.name ||
                  selected?.user?.email ||
                  selected?.userId ||
                  "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={busy}>{t("cancel")}</AlertDialogClose>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void transfer()}
            >
              {busy ? t("transferringOwnership") : t("transferOwnership")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  )
}
