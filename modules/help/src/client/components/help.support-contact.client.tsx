"use client"

import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { MailIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

function buildSupportMailto({
  email,
  locale,
  userId,
}: {
  readonly email: string
  readonly locale: string
  readonly userId: string
}): string {
  const subject = encodeURIComponent("Account support request")
  const body = encodeURIComponent(
    [
      "Hello support team,",
      "",
      `User id: ${userId}`,
      `Locale: ${locale}`,
      "",
      "Describe your issue below:",
      "",
    ].join("\n")
  )
  return `mailto:${email}?subject=${subject}&body=${body}`
}

export function HelpSupportContactScreen({
  supportEmail,
}: {
  readonly supportEmail: string
}) {
  const t = useTranslations("ui")
  const locale = useLocale()
  const { data: session, isPending } = authClient.useSession()
  const userId = session?.user.id ?? ""

  if (isPending) {
    return <Skeleton className="h-28 w-full" />
  }

  if (!supportEmail) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("helpSupportEmailUnset")}
      </p>
    )
  }

  if (!userId) {
    return <p className="text-sm text-muted-foreground">{t("sessionEnded")}</p>
  }

  const mailto = buildSupportMailto({
    email: supportEmail,
    locale,
    userId,
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("helpSupportContactDescription")}
      </p>
      <Button render={<a href={mailto} />}>
        {t("helpContactSupport")}
        <MailIcon aria-hidden className="size-4" />
      </Button>
      <p className="text-xs text-muted-foreground">
        {t("helpSupportMailtoHint")}
      </p>
    </div>
  )
}
