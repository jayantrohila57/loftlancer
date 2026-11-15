"use client"

import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
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
import Shell from "@packages/ui/components/shell"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { useActivityApi } from "../hooks/activity.activity.hooks"
import { UnifiedActivityFeed } from "./activity.unified.client"

function SecurityLoginActivityHistoryClear() {
  const t = useTranslations("ui")
  const { data: current } = authClient.useSession()
  const clearActivity = useActivityApi.useClear(current?.user.id)
  const [confirm, setConfirm] = useState(false)
  const busy = clearActivity.isPending
  async function remove() {
    try {
      const cleared = await clearActivity.mutateAsync({ scope: "security" })
      const ok = cleared.status === "success"
      toastManager.add({
        title: ok ? t("activityDeleted") : t("operationFailed"),
        type: ok
          ? "success"
          : cleared.status === "failed"
            ? "warning"
            : "error",
      })
      if (ok) setConfirm(false)
    } catch {
      toastManager.add({
        title: t("couldNotDeleteActivityHistory"),
        type: "error",
      })
    }
  }
  return (
    <>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setConfirm(true)}
        >
          <Trash2 />
          {t("deleteHistory")}
        </Button>
      </div>
      <AlertDialog
        open={confirm}
        onOpenChange={(open) => {
          if (!busy) setConfirm(open)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteActivityTitle", { kind: "security" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteActivityDescription", { kind: "security" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={busy} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? <Spinner /> : <Trash2 />}{" "}
              {busy ? t("deleting") : t("deleteHistory")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}

export function SecurityLoginActivityView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t(
            "reviewObservedSignInsAndSecurityEventsFailedAttemptsAreNotYetRecorded"
          )}
          title={t("loginSecurityActivity")}
        >
          <div className="space-y-4">
            <UnifiedActivityFeed scope="security" />
            <SecurityLoginActivityHistoryClear />
          </div>
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
