"use client"

import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { Spinner } from "@packages/ui/components/spinner"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { studioAbsolutePath } from "@/shared/org/studio-org.paths"

type Invitation = {
  readonly id: string
  readonly organizationName?: string | null
  readonly organizationSlug?: string | null
  readonly role?: string | null
  readonly status?: string
}

export function StudioInviteResponse({
  invitationId,
}: {
  readonly invitationId: string
}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const result = await authClient.organization.listUserInvitations()
        if (result.error) {
          throw new Error(result.error.message || t("invitationsLoadError"))
        }
        const match = (result.data ?? []).find(
          (item: Invitation) => item.id === invitationId
        )
        if (!cancelled) {
          setInvitation(match ?? null)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t("invitationsLoadError")
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [invitationId, t])

  async function respond(accept: boolean) {
    if (busy) return
    setBusy(true)
    try {
      const result = accept
        ? await authClient.organization.acceptInvitation({ invitationId })
        : await authClient.organization.rejectInvitation({ invitationId })
      if (result.error) {
        throw new Error(result.error.message || t("invitationActionError"))
      }
      if (accept) {
        const payload = result.data as
          | { organization?: { id?: string; slug?: string } }
          | undefined
        const organizationId = payload?.organization?.id
        if (organizationId) {
          await authClient.organization.setActive({ organizationId })
        }
        const slug = payload?.organization?.slug
        window.location.assign(
          slug
            ? studioAbsolutePath(locale, `/${slug}`)
            : studioAbsolutePath(locale, "/organizations")
        )
        return
      }
      window.location.assign(studioAbsolutePath(locale, "/organizations"))
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invitationActionError"))
      setBusy(false)
    }
  }

  if (sessionPending || loading) {
    return <Spinner className="size-5" />
  }

  if (!session?.user) {
    return null
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!invitation) {
    return (
      <p className="text-sm text-muted-foreground">{t("inviteNotFound")}</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        {invitation.organizationName ?? t("organization")}
        {invitation.role ? ` · ${invitation.role}` : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={() => void respond(true)}
        >
          {busy ? t("loading") : t("acceptInvitation")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void respond(false)}
        >
          {t("declineInvitation")}
        </Button>
      </div>
    </div>
  )
}
