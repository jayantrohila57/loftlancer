"use client"

import { useShellNavigation } from "@features/shell"
import { authClient } from "@packages/better-auth/client"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useTranslations } from "next-intl"
import { AuthSessionEndedNotice } from "../session-ended/auth.session-ended-notice.client"

export function AuthAccountOverviewSummary() {
  const t = useTranslations("ui")

  const { data, isPending, error, refetch } = authClient.useSession()
  if (isPending) {
    return <Skeleton className="h-12 w-48" />
  }
  if (error) {
    return (
      <div>
        {t("unableToLoadYourAccount")}{" "}
        <button type="button" className="underline" onClick={() => refetch()}>
          {t("tryAgain")}
        </button>
      </div>
    )
  }
  if (!data?.user) {
    return <AuthSessionEndedNotice />
  }
  return (
    <dl className="space-y-2">
      <div>
        <dt className="font-medium text-foreground">{t("name")}</dt>
        <dd>{data.user.name}</dd>
      </div>
      <div>
        <dt className="font-medium text-foreground">{t("email")}</dt>
        <dd>{data.user.email}</dd>
      </div>
    </dl>
  )
}

export function AuthAccountOverviewManage() {
  const t = useTranslations("ui")

  const { Link } = useShellNavigation()
  return (
    <div className="flex gap-4">
      <Link href="/account/profile" className="underline">
        {t("profile")}
      </Link>
      <Link href="/account/security" className="underline">
        {t("security")}
      </Link>
    </div>
  )
}
