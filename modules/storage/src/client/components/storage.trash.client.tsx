"use client"

import {
  ORG_OWNER_MEMBER_ROLE,
  useOrgActiveMemberRole,
  useOrgSessionActiveId,
  useOrgSessionActiveIdPending,
} from "@modules/org"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/components/table"
import { toastManager } from "@packages/ui/components/toast"
import { HardDrive, Trash2 } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"

import { formatStorageBytesForAccount } from "../../utils/storage.format-bytes.client"
import { useStorageApi } from "../hooks/storage.api"
import { storageTrashRestoreMessage } from "../storage.trash-restore.errors"
import { StorageConfirmNameDialog } from "./storage.confirm-name-dialog.client"

export function StorageTrashScreen() {
  const t = useTranslations("ui")
  const format = useFormatter()
  const organizationId = useOrgSessionActiveId()
  const orgResolving = useOrgSessionActiveIdPending()
  const { role, isPending: rolePending } = useOrgActiveMemberRole()
  const isOrgOwner = !rolePending && role === ORG_OWNER_MEMBER_ROLE
  const trash = useStorageApi.useTrash(organizationId)
  const restoreItem = useStorageApi.useRestoreItem(organizationId)
  const purgeItem = useStorageApi.usePurgeItem(organizationId)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [purgeTarget, setPurgeTarget] = useState<{
    id: string
    displayName: string
  } | null>(null)
  const [purgeOpen, setPurgeOpen] = useState(false)
  const [purgePending, setPurgePending] = useState(false)

  if (orgResolving) {
    return <Skeleton className="h-16 w-full" />
  }

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HardDrive />
          </EmptyMedia>
          <EmptyTitle>{t("storageNoActiveOrgTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("storageNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (trash.isPending) {
    return <Skeleton className="h-32 w-full" />
  }

  if (trash.isError || !trash.data) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("storageTrashLoadError")}
      </p>
    )
  }

  const { items } = trash.data
  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trash2 />
          </EmptyMedia>
          <EmptyTitle>{t("storageTrashEmptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("storageTrashEmptyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  async function confirmPurge() {
    if (!purgeTarget) return
    setPurgePending(true)
    try {
      await toastManager.promise(purgeItem(purgeTarget.id), {
        loading: t("storagePurgeInProgress"),
        success: t("storagePurgeSuccess"),
        error: t("storagePurgeError"),
      })
      setPurgeOpen(false)
      setPurgeTarget(null)
    } catch {
      /* toast reports failure */
    } finally {
      setPurgePending(false)
    }
  }

  return (
    <div className="space-y-3">
      {restoreError ? (
        <p className="text-sm text-destructive" role="alert">
          {restoreError}
        </p>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("storageTableName")}</TableHead>
            <TableHead>{t("storageTableSize")}</TableHead>
            <TableHead>{t("storageTrashDeletedColumn")}</TableHead>
            <TableHead className="w-40">
              {t("storageTrashActionsColumn")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.displayName}</TableCell>
              <TableCell>
                {formatStorageBytesForAccount(item.byteSize, format)}
              </TableCell>
              <TableCell>
                {format.dateTime(new Date(item.trashedAt), "dateTime")}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={restoringId === item.id}
                    onClick={async () => {
                      setRestoringId(item.id)
                      setRestoreError(null)
                      try {
                        await restoreItem(item.id)
                      } catch (error) {
                        setRestoreError(storageTrashRestoreMessage(t, error))
                      } finally {
                        setRestoringId(null)
                      }
                    }}
                    size="sm"
                    variant="outline"
                  >
                    {t("storageRestoreFile")}
                  </Button>
                  {isOrgOwner ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setPurgeTarget({
                          id: item.id,
                          displayName: item.displayName,
                        })
                        setPurgeOpen(true)
                      }}
                    >
                      {t("storagePurgeForever")}
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <StorageConfirmNameDialog
        open={purgeOpen}
        title={t("storagePurgeConfirmTitle")}
        description={t("storagePurgeConfirmDescription")}
        expectedName={purgeTarget?.displayName ?? ""}
        confirmLabel={t("storagePurgeForever")}
        pending={purgePending}
        onOpenChange={setPurgeOpen}
        onConfirm={confirmPurge}
      />
    </div>
  )
}
