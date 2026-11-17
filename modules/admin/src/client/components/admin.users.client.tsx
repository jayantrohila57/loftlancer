"use client"

import { throwOnServiceResponseFailure } from "@modules/auth"
import { securityRpc } from "@modules/security/client"
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
import { Field, FieldLabel } from "@packages/ui/components/field"
import { Input } from "@packages/ui/components/input"
import { Textarea } from "@packages/ui/components/textarea"
import { toastManager } from "@packages/ui/components/toast"
import { useState } from "react"

import { useAdminBanUser, useAdminUnbanUser } from "../hooks/admin.users.api"
import type { AdminUsersLabels, AdminUsersListItem } from "./admin.users"

export function AdminUsersManagementClient(props: {
  labels: AdminUsersLabels
  initialUsers: AdminUsersListItem[]
}) {
  const [users, setUsers] = useState(props.initialUsers)
  const banUser = useAdminBanUser()
  const unbanUser = useAdminUnbanUser()
  const [banTarget, setBanTarget] = useState<AdminUsersListItem | null>(null)
  const [banReason, setBanReason] = useState("")
  const [banExpiresAt, setBanExpiresAt] = useState("")
  const [unbanTarget, setUnbanTarget] = useState<AdminUsersListItem | null>(
    null
  )

  async function refreshUsers() {
    const response = await securityRpc.security.admin.users.list({
      limit: 50,
      offset: 0,
    })
    throwOnServiceResponseFailure(response)
    if (!response.data) return
    setUsers(
      response.data.users.map((user) => ({
        ...user,
        role: user.role ?? null,
        banned: user.banned ?? false,
      }))
    )
  }

  async function confirmBan() {
    if (!banTarget) return
    try {
      await banUser.mutateAsync({
        banExpiresAt: banExpiresAt ? new Date(banExpiresAt) : undefined,
        banReason: banReason.trim() || undefined,
        userId: banTarget.id,
      })
      toastManager.add({ title: props.labels.banSuccess, type: "success" })
      setBanTarget(null)
      setBanReason("")
      setBanExpiresAt("")
      await refreshUsers()
    } catch (error) {
      toastManager.add({
        title: error instanceof Error ? error.message : props.labels.banFailed,
        type: "error",
      })
    }
  }

  async function confirmUnban() {
    if (!unbanTarget) return
    try {
      await unbanUser.mutateAsync({ userId: unbanTarget.id })
      toastManager.add({ title: props.labels.unbanSuccess, type: "success" })
      setUnbanTarget(null)
      await refreshUsers()
    } catch (error) {
      toastManager.add({
        title:
          error instanceof Error ? error.message : props.labels.unbanFailed,
        type: "error",
      })
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">{props.labels.name}</th>
              <th className="px-3 py-2 font-medium">{props.labels.email}</th>
              <th className="px-3 py-2 font-medium">{props.labels.verified}</th>
              <th className="px-3 py-2 font-medium">{props.labels.role}</th>
              <th className="px-3 py-2 font-medium">{props.labels.status}</th>
              <th className="px-3 py-2 font-medium">{props.labels.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={6}>
                  {props.labels.empty}
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr className="border-b last:border-b-0" key={item.id}>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.email}</td>
                  <td className="px-3 py-2">
                    {item.emailVerified ? props.labels.yes : props.labels.no}
                  </td>
                  <td className="px-3 py-2">{item.role ?? "user"}</td>
                  <td className="px-3 py-2">
                    {item.banned ? props.labels.banned : props.labels.active}
                  </td>
                  <td className="px-3 py-2">
                    {item.banned ? (
                      <Button
                        onClick={() => setUnbanTarget(item)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {props.labels.unbanAction}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setBanTarget(item)}
                        size="sm"
                        type="button"
                        variant="destructive"
                      >
                        {props.labels.banAction}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog
        onOpenChange={(open) => !open && setBanTarget(null)}
        open={Boolean(banTarget)}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{props.labels.banConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {props.labels.banConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 px-4">
            <Field>
              <FieldLabel htmlFor="admin-ban-reason">
                {props.labels.banReason}
              </FieldLabel>
              <Textarea
                id="admin-ban-reason"
                onChange={(event) => setBanReason(event.target.value)}
                value={banReason}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-ban-expires">
                {props.labels.banExpires}
              </FieldLabel>
              <Input
                id="admin-ban-expires"
                onChange={(event) => setBanExpiresAt(event.target.value)}
                type="datetime-local"
                value={banExpiresAt}
              />
            </Field>
          </div>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>
              {props.labels.cancel}
            </AlertDialogClose>
            <Button
              disabled={banUser.isPending}
              onClick={() => void confirmBan()}
              type="button"
              variant="destructive"
            >
              {props.labels.banAction}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => !open && setUnbanTarget(null)}
        open={Boolean(unbanTarget)}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {props.labels.unbanConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {props.labels.unbanConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>
              {props.labels.cancel}
            </AlertDialogClose>
            <Button
              disabled={unbanUser.isPending}
              onClick={() => void confirmUnban()}
              type="button"
            >
              {props.labels.unbanAction}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
