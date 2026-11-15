"use client"

import { FieldKit } from "@features/form"
import { capturePermittedLocation } from "@modules/auth"
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
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@packages/ui/components/preview-card"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { Info, MapPin, ShieldCheck, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"
import { z } from "zod"
import { useBrowserLocationPermission } from "../hooks/location.hook.browser-permission"
import { useLocationApi } from "../hooks/location.location.hooks"

const permissionSchema = z.object({ enabled: z.boolean() })

type LocationState = import("../../utils/types/location.types").LocationState

async function requestLocation(): Promise<GeolocationPosition> {
  if (!navigator.geolocation)
    throw new Error("Location is not supported by this browser.")
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 0,
    })
  )
}
export function SecurityLocationPrompt({
  destination,
}: {
  destination: string
}) {
  const t = useTranslations("ui")

  const { readState, setPreference, saveLocation } = useLocationApi.useActions()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const finish = useCallback(() => {
    window.location.assign(destination)
  }, [destination])
  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const response = await readState()
        if (!active) return
        if (response.status !== "success") {
          finish()
          return
        }
        const state = response.data
        if (!state.decided) {
          setOpen(true)
          return
        }
        if (state.enabled) await capturePermittedLocation()
      } catch {
        /* Location must never block sign-in. */
      }
      if (active) finish()
    })()
    return () => {
      active = false
    }
  }, [finish, readState])
  async function enable() {
    setBusy(true)
    setError("")
    try {
      const initial = await readState()
      if (initial.status !== "success")
        throw new Error("Location settings unavailable.")
      const position = await requestLocation()
      const preference = await setPreference(true)
      if (preference.status !== "success") {
        setError(t("operationFailed"))
        setBusy(false)
        return
      }
      const saved = await saveLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        generation: initial.data.generation,
      })
      if (saved.status !== "success") {
        setError(t("operationFailed"))
        setBusy(false)
        return
      }
      finish()
    } catch {
      setError(t("locationRequestFailed"))
      setBusy(false)
    }
  }
  async function skip() {
    setBusy(true)
    try {
      await setPreference(false)
    } catch {
      /* Continue even if settings cannot be saved. */
    }
    finish()
  }
  return (
    <AlertDialog open={open}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("helpProtectYourAccount")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("locationPromptDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <Button variant="outline" disabled={busy} onClick={skip}>
            {t("skip")}
          </Button>
          <Button loading={busy} onClick={enable}>
            {t("enableLocation")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}

export function SecurityPermissionsScreen() {
  const t = useTranslations("ui")

  const { readState, setPreference, saveLocation, deleteHistory } =
    useLocationApi.useActions()
  const [state, setState] = useState<LocationState | null>(null)
  const [stateLoading, setStateLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [fieldVersion, setFieldVersion] = useState(0)
  const browserPermission = useBrowserLocationPermission()
  const load = useCallback(async () => {
    setStateLoading(true)
    try {
      const response = await readState()
      if (response.status !== "success") {
        setError(t("operationFailed"))
        setState(null)
        return
      }
      setState(response.data)
      setError("")
    } catch {
      setError(t("operationFailed"))
      setState(null)
    } finally {
      setStateLoading(false)
    }
  }, [readState, t])
  useEffect(() => {
    void load()
  }, [load])
  async function enable() {
    setBusy(true)
    setError("")
    try {
      const initial = await readState()
      if (initial.status !== "success")
        throw new Error("Location settings unavailable.")
      const position = await requestLocation()
      const preference = await setPreference(true)
      if (preference.status !== "success") {
        setError(t("operationFailed"))
        toastManager.add({
          title: t("operationFailed"),
          type: preference.status === "failed" ? "warning" : "error",
        })
        return
      }
      const saved = await saveLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        generation: initial.data.generation,
      })
      if (saved.status !== "success") {
        await load()
        setError(t("operationFailed"))
        toastManager.add({
          title: t("operationFailed"),
          type: saved.status === "failed" ? "warning" : "error",
        })
        return
      }
      toastManager.add({ title: t("locationEnabled"), type: "success" })
      await load()
    } catch {
      await load()
      setError(t("locationRequestFailed"))
    } finally {
      setBusy(false)
    }
  }
  async function disable() {
    setBusy(true)
    setError("")
    try {
      const result = await setPreference(false)
      toastManager.add({
        title:
          result.status === "success"
            ? t("locationUpdated")
            : t("operationFailed"),
        type:
          result.status === "success"
            ? "success"
            : result.status === "failed"
              ? "warning"
              : "error",
      })
      if (result.status !== "success") {
        setError(t("operationFailed"))
        return
      }
      setConfirmDisable(false)
      await load()
    } catch {
      setError(t("operationFailed"))
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    setBusy(true)
    setError("")
    try {
      const result = await deleteHistory()
      toastManager.add({
        title:
          result.status === "success"
            ? t("locationUpdated")
            : t("operationFailed"),
        type:
          result.status === "success"
            ? "success"
            : result.status === "failed"
              ? "warning"
              : "error",
      })
      if (result.status !== "success") {
        setError(t("operationFailed"))
        return
      }
      setConfirmDelete(false)
      await load()
    } catch {
      setError(t("operationFailed"))
    } finally {
      setBusy(false)
    }
  }

  if (stateLoading) {
    return (
      <div className="space-y-5" role="status" aria-busy="true">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full max-w-md" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-muted p-2">
            <MapPin className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{t("locationForSecurity")}</p>
              <PreviewCard>
                <PreviewCardTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("aboutLocationRetentionAndMapPrivacy")}
                    />
                  }
                >
                  <Info className="size-4" />
                </PreviewCardTrigger>
                <PreviewCardPopup>
                  {t("locationRetentionDescription")}
                </PreviewCardPopup>
              </PreviewCard>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("locationOptionalDescription")}
            </p>
          </div>
          <div className="w-auto shrink-0">
            <FieldKit
              key={fieldVersion}
              schema={permissionSchema}
              values={{ enabled: state?.enabled ?? false }}
              onValuesChange={(next) => {
                if (
                  !state ||
                  busy ||
                  typeof next.enabled !== "boolean" ||
                  next.enabled === state.enabled
                )
                  return
                setFieldVersion((version) => version + 1)
                if (state.enabled) setConfirmDisable(true)
                else void enable()
              }}
            >
              <FieldKit.Field
                type="switch"
                name="enabled"
                label={t("locationCollection")}
                disabled={!state || busy}
              />
            </FieldKit>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-start gap-3 border-t pt-5">
          <div className="rounded-lg bg-muted p-2">
            <Trash2 className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium">{t("locationHistory")}</p>
            <p className="text-sm text-muted-foreground">
              {t("deleteLocationSummary")}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            disabled={!state || busy}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 />
            {t("deleteLocationHistory")}
          </Button>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t("browserPermissionLabel")}{" "}
            {browserPermission === "granted"
              ? t("allowed")
              : browserPermission === "denied"
                ? t("blocked")
                : browserPermission === "prompt"
                  ? t("notGranted")
                  : t("unavailable")}
          </div>
          <p className="mt-1 text-muted-foreground">
            {t("browserPermissionDescription")}
          </p>
          {state?.enabled && browserPermission !== "granted" && (
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={enable}
            >
              {t("enableOnThisBrowser")}
            </Button>
          )}
        </div>
      </div>
      <AlertDialog
        open={confirmDisable}
        onOpenChange={(open) => {
          if (!busy) setConfirmDisable(open)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("turnOffLocationCollectionConfirm")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("disableLocationDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={busy} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button variant="destructive" disabled={busy} onClick={disable}>
              {busy ? <Spinner /> : <MapPin />}{" "}
              {busy ? t("turningOff") : t("turnOffLocation")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
      <AlertDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!busy) setConfirmDelete(open)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteLocationHistoryConfirm")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteLocationDescription")}
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
              {busy ? t("deleting") : t("deleteLocations")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
