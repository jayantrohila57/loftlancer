"use client"

import { buildAuthSignInLocation } from "@modules/auth"
import { AccountUserMenuLoader } from "@modules/shell"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import { LogIn } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

function AccountMenuSkeleton() {
  return (
    <Skeleton aria-hidden="true" className="size-9 rounded-full sm:size-8" />
  )
}

export function WebSiteHeaderAuth() {
  const [mounted, setMounted] = useState(false)
  const locale = useLocale()
  const t = useTranslations("ui")
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isPending) {
    return <AccountMenuSkeleton />
  }

  if (data?.user) {
    return <AccountUserMenuLoader />
  }

  return (
    <Button
      render={<a href={buildAuthSignInLocation({ locale })} />}
      size="sm"
      variant="ghost"
    >
      <LogIn aria-hidden className="size-4" />
      {t("signIn")}
    </Button>
  )
}
