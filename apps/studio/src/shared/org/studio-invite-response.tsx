"use client"

import { authClient } from "@packages/better-auth/client"
import { clientEnv } from "@packages/t3-env/client"
import { Button } from "@packages/ui/components/button"
import { Spinner } from "@packages/ui/components/spinner"
import { useLocale, useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"
import { studioAbsolutePath } from "@/shared/org/studio-org.paths"

type Invitation = {
  readonly id: string
  readonly organizationName?: string | null
  readonly organizationSlug?: string | null
  readonly role?: string | null
  readonly status?: string
}

type InvitePreview = {
  readonly id: string
  readonly email: string
  readonly maskedEmail: string
  readonly status: string
  readonly expiresAt: string
  readonly organizationName: string
  readonly organizationSlug: string | null
  readonly role: string
  readonly expired: boolean
}

export function StudioInviteResponse({
  invitationId,
  preview,
}: {
  readonly invitationId: string
  readonly preview: InvitePreview | null
}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sessionEmail = session?.user.email?.toLowerCase() ?? ""
  const previewEmail = preview?.email.toLowerCase() ?? ""
  const emailMatches =
    Boolean(sessionEmail) &&
    Boolean(previewEmail) &&
    sessionEmail === previewEmail

  const loadInvitation = useCallback(async () => {
    if (!preview || preview.status !== "pending" || preview.expired) {
      setInvitation(null)
      setLoading(false)
      return
    }
    if (!emailMatches) {
      setInvitation(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const result = await authClient.organization.getInvitation({
        query: { id: invitationId },
      })
      if (result.error) {
        throw new Error(result.error.message || t("invitationsLoadError"))
      }
      const payload = result.data as Invitation | undefined
      setInvitation(payload ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invitationsLoadError"))
      setInvitation(null)
    } finally {
      setLoading(false)
    }
  }, [emailMatches, invitationId, preview, t])

  useEffect(() => {
    void loadInvitation()
  }, [loadInvitation])

  async function switchAccount() {
    const authBase = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
    const returnTo = studioAbsolutePath(locale, `/invite/${invitationId}`)
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          const login = new URL(`${authBase}/${locale}/sign-in`)
          login.searchParams.set("returnTo", returnTo)
          window.location.assign(login.toString())
        },
      },
    })
  }

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

  if (!preview) {
    return (
      <p className="text-sm text-muted-foreground">{t("inviteNotFound")}</p>
    )
  }

  if (preview.status === "expired" || preview.expired) {
    return <p className="text-sm text-muted-foreground">{t("inviteExpired")}</p>
  }

  if (preview.status === "accepted") {
    return (
      <p className="text-sm text-muted-foreground">
        {t("inviteAlreadyAccepted")}
      </p>
    )
  }

  if (preview.status === "canceled" || preview.status === "rejected") {
    return (
      <p className="text-sm text-muted-foreground">{t("inviteCanceled")}</p>
    )
  }

  if (preview.status === "pending" && !emailMatches) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {t("inviteWrongAccount", { email: preview.maskedEmail })}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void switchAccount()}
        >
          {t("switchAccountForInvite")}
        </Button>
      </div>
    )
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
        {invitation.organizationName ??
          preview.organizationName ??
          t("organization")}
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
