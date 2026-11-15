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
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@packages/ui/components/menu"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@packages/ui/components/progress"
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
import {
  ArrowLeft,
  Download,
  FileIcon,
  FolderIcon,
  HardDrive,
  MoreHorizontal,
  Trash2,
  Upload,
  Users,
} from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useCallback, useRef, useState } from "react"
import { formatStorageBytesForAccount } from "../../utils/storage.format-bytes.client"
import { useStorageApi } from "../hooks/storage.api"
import { fetchStorageDownloadUrl } from "../hooks/storage.hook.download"
import { useStorageFileActions } from "../hooks/storage.hook.file-actions"
import { isStorageNotProvisionedError } from "../utils/storage.provision.errors"
import type { StorageUploadProgress } from "../utils/storage.upload.queue.client"
import { enqueueOrgStorageUpload } from "../utils/storage.upload.queue.client"
import { StorageConfirmNameDialog } from "./storage.confirm-name-dialog.client"
import { StorageFilesGrantsSheet } from "./storage.files.grants-sheet.client"

function StorageFilesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

type GrantTargetState =
  | {
      readonly kind: "folder"
      readonly id: string
      readonly displayName: string
    }
  | { readonly kind: "file"; readonly id: string; readonly displayName: string }
  | null

type TrashTargetState = {
  readonly id: string
  readonly displayName: string
} | null

export function StorageFilesScreen() {
  const t = useTranslations("ui")
  const format = useFormatter()
  const organizationId = useOrgSessionActiveId()
  const orgResolving = useOrgSessionActiveIdPending()
  const { role, isPending: rolePending } = useOrgActiveMemberRole()
  const isOrgOwner = !rolePending && role === ORG_OWNER_MEMBER_ROLE

  const [folderStack, setFolderStack] = useState<
    { id: string; displayName: string }[]
  >([])
  const currentFolderId = folderStack.at(-1)?.id
  const list = useStorageApi.useList(organizationId, currentFolderId)
  const fileActions = useStorageFileActions(organizationId, currentFolderId)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] =
    useState<StorageUploadProgress | null>(null)
  const [uploading, setUploading] = useState(false)

  const [grantOpen, setGrantOpen] = useState(false)
  const [grantTarget, setGrantTarget] = useState<GrantTargetState>(null)

  const [trashOpen, setTrashOpen] = useState(false)
  const [trashTarget, setTrashTarget] = useState<TrashTargetState>(null)
  const [trashPending, setTrashPending] = useState(false)

  const [downloadId, setDownloadId] = useState<string | null>(null)

  const resolveUploadError = useCallback(
    (key: string | undefined) => {
      if (key === "storageUploadQuotaExceeded")
        return t("storageUploadQuotaExceeded")
      if (key === "storageUploadFileTooLarge")
        return t("storageUploadFileTooLarge")
      if (key === "storageUploadMimeNotAllowed")
        return t("storageUploadMimeNotAllowed")
      return key || t("storageUploadFailed")
    },
    [t]
  )

  async function handleFilesSelected(files: FileList | null) {
    if (!files?.length || uploading) return
    const file = files.item(0)
    if (!file) return
    setUploading(true)
    try {
      await toastManager.promise(
        enqueueOrgStorageUpload({
          file,
          folderId: currentFolderId,
          onProgress: setUploadProgress,
        }),
        {
          loading: t("storageUploadInProgress"),
          success: t("storageUploadSuccess"),
          error: (error) =>
            resolveUploadError(
              error instanceof Error ? error.message : "storageUploadFailed"
            ),
        }
      )
      await list.refetch()
    } catch {
      /* toast reports failure */
    } finally {
      setUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function downloadItem(itemId: string, displayName: string) {
    setDownloadId(itemId)
    try {
      const data = await fetchStorageDownloadUrl(itemId)
      const link = document.createElement("a")
      link.href = data.url
      link.download = displayName
      link.rel = "noopener"
      document.body.append(link)
      link.click()
      link.remove()
    } catch {
      toastManager.add({
        type: "error",
        title: t("storageDownloadError"),
      })
    } finally {
      setDownloadId(null)
    }
  }

  async function confirmTrash() {
    if (!trashTarget) return
    setTrashPending(true)
    try {
      await toastManager.promise(fileActions.trashItem(trashTarget.id), {
        loading: t("storageTrashMoving"),
        success: t("storageTrashMoved"),
        error: t("storageTrashMoveError"),
      })
      setTrashOpen(false)
      setTrashTarget(null)
      await list.refetch()
    } catch {
      /* toast reports failure */
    } finally {
      setTrashPending(false)
    }
  }

  if (orgResolving) return <StorageFilesSkeleton />

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

  if (list.isPending) return <StorageFilesSkeleton />

  if (list.isError || !list.data) {
    if (list.isError && isStorageNotProvisionedError(list.error)) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HardDrive />
            </EmptyMedia>
            <EmptyTitle>{t("storageNotProvisionedTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("storageNotProvisionedDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" onClick={() => list.refetch().catch(() => {})}>
            {t("tryAgain")}
          </Button>
        </Empty>
      )
    }
    return (
      <Empty role="status">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HardDrive />
          </EmptyMedia>
          <EmptyTitle>{t("storageFilesLoadError")}</EmptyTitle>
        </EmptyHeader>
        <Button
          type="button"
          variant="outline"
          onClick={() => list.refetch().catch(() => {})}
        >
          {t("tryAgain")}
        </Button>
      </Empty>
    )
  }

  const { folders, items } = list.data
  const isEmpty = folders.length === 0 && items.length === 0
  const uploadPercent =
    uploadProgress?.phase === "upload"
      ? 66
      : uploadProgress?.phase === "init"
        ? 33
        : uploadProgress?.phase === "done"
          ? 100
          : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {folderStack.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setFolderStack((stack) => stack.slice(0, -1))}
            >
              <ArrowLeft className="size-4" />
              {t("storageBackToParent")}
            </Button>
          ) : null}
          {folderStack.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {folderStack.map((folder) => folder.displayName).join(" / ")}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => void handleFilesSelected(event.target.files)}
          />
          <Button
            type="button"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {t("storageUploadFile")}
          </Button>
        </div>
      </div>

      {uploadProgress ? (
        <div className="space-y-2 rounded-md border p-3 text-sm">
          <p className="font-medium">{uploadProgress.fileName}</p>
          <Progress value={uploadPercent}>
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
          <p className="text-muted-foreground">
            {uploadProgress.phase === "init"
              ? t("storageUploadPhaseInit")
              : uploadProgress.phase === "upload"
                ? t("storageUploadPhaseTransfer")
                : uploadProgress.phase === "done"
                  ? t("storageUploadPhaseDone")
                  : resolveUploadError(uploadProgress.error)}
          </p>
        </div>
      ) : null}

      {isEmpty ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon />
            </EmptyMedia>
            <EmptyTitle>{t("storageFilesEmptyTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("storageFilesEmptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("storageUploadFile")}
          </Button>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("storageTableName")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("storageTableType")}
              </TableHead>
              <TableHead className="text-right">
                {t("storageTableSize")}
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{t("storageTableActions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.map((folder) => (
              <TableRow key={folder.id}>
                <TableCell className="font-medium">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto justify-start gap-2 p-0 font-medium"
                    onClick={() =>
                      setFolderStack((stack) => [
                        ...stack,
                        { id: folder.id, displayName: folder.displayName },
                      ])
                    }
                  >
                    <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
                    {folder.displayName}
                  </Button>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {t("storageFolderType")}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {t("storageFolderSizeUnavailable")}
                </TableCell>
                <TableCell className="text-right">
                  {isOrgOwner ? (
                    <Menu>
                      <MenuTrigger
                        render={
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("storageRowActions")}
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </MenuTrigger>
                      <MenuPopup align="end">
                        <MenuItem
                          onClick={() => {
                            setGrantTarget({
                              kind: "folder",
                              id: folder.id,
                              displayName: folder.displayName,
                            })
                            setGrantOpen(true)
                          }}
                        >
                          <Users className="size-4" />
                          {t("storageManageAccess")}
                        </MenuItem>
                      </MenuPopup>
                    </Menu>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                    {item.displayName}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {item.contentType}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatStorageBytesForAccount(item.byteSize, format)}
                </TableCell>
                <TableCell className="text-right">
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={t("storageRowActions")}
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </MenuTrigger>
                    <MenuPopup align="end">
                      <MenuItem
                        disabled={downloadId === item.id}
                        onClick={() =>
                          void downloadItem(item.id, item.displayName)
                        }
                      >
                        <Download className="size-4" />
                        {t("storageDownloadFile")}
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setTrashTarget({
                            id: item.id,
                            displayName: item.displayName,
                          })
                          setTrashOpen(true)
                        }}
                      >
                        <Trash2 className="size-4" />
                        {t("storageMoveToTrash")}
                      </MenuItem>
                      {isOrgOwner ? (
                        <MenuItem
                          onClick={() => {
                            setGrantTarget({
                              kind: "file",
                              id: item.id,
                              displayName: item.displayName,
                            })
                            setGrantOpen(true)
                          }}
                        >
                          <Users className="size-4" />
                          {t("storageManageAccess")}
                        </MenuItem>
                      ) : null}
                    </MenuPopup>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isOrgOwner ? (
        <StorageFilesGrantsSheet
          open={grantOpen}
          organizationId={organizationId}
          target={grantTarget}
          onOpenChange={(open) => {
            setGrantOpen(open)
            if (!open) setGrantTarget(null)
          }}
        />
      ) : null}

      <StorageConfirmNameDialog
        open={trashOpen}
        title={t("storageTrashConfirmTitle")}
        description={t("storageTrashConfirmDescription")}
        expectedName={trashTarget?.displayName ?? ""}
        confirmLabel={t("storageMoveToTrash")}
        pending={trashPending}
        onOpenChange={setTrashOpen}
        onConfirm={confirmTrash}
      />
    </div>
  )
}
