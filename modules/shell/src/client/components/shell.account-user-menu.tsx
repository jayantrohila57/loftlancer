"use client"

import { authSessionApi } from "@modules/auth/client/hooks/auth.session.hooks"
import { authClient } from "@packages/better-auth/client"
import { QueryProvider } from "@packages/react-query"
import { clientEnv } from "@packages/t3-env/client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@packages/ui/components/avatar"
import { Button } from "@packages/ui/components/button"
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@packages/ui/components/menu"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { LogOut, UserRound } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

const api = { auth: authSessionApi }

function AccountUserMenuContent() {
  const t = useTranslations("ui")

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const { data, isPending } = authClient.useSession()
  const locale = useLocale()
  const [signingOut, setSigningOut] = useState(false)
  const signOutMutation = api.auth.useSignOut()
  const previousUser = useRef(data?.user)
  if (data?.user) previousUser.current = data.user
  const user = data?.user ?? (signingOut ? previousUser.current : undefined)
  const base = clientEnv.NEXT_PUBLIC_AUTH_APP_URL.replace(/\/$/, "")
  const accountUrl = `${base}/${locale}/account`
  const signInUrl = `${base}/${locale}/sign-in`

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await toastManager.promise(
        (async () => {
          await signOutMutation.mutateAsync()
        })(),
        {
          loading: t("signingOut"),
          success: t("signedOut"),
          error: (error: unknown) =>
            error instanceof Error ? error.message : t("couldNotSignOut"),
        }
      )
      window.location.assign(signInUrl)
    } catch {
      setSigningOut(false)
    }
  }

  if (!mounted || (isPending && !user))
    return (
      <Skeleton aria-hidden="true" className="size-9 rounded-full sm:size-8" />
    )
  if (!user) return null
  const initials = (user.name || user.email)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            aria-label={t("accountMenu")}
            variant="ghost"
            size="icon"
            className="rounded-full p-0"
          />
        }
      >
        <Avatar className="size-9 sm:size-8">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuPopup align="end" className="w-56">
        <div className="min-w-0 px-2 py-1.5">
          <div className="truncate text-sm font-medium">
            {user.name || t("account")}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {user.email}
          </div>
        </div>
        <MenuSeparator />
        <MenuLinkItem href={accountUrl}>
          <UserRound />
          {t("account")}
        </MenuLinkItem>
        <MenuItem closeOnClick={false} disabled={signingOut} onClick={signOut}>
          {signingOut ? <Spinner className="size-4" /> : <LogOut />}
          {signingOut ? t("signingOut") : t("signOut")}
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}

export function AccountUserMenu() {
  return (
    <QueryProvider>
      <AccountUserMenuContent />
    </QueryProvider>
  )
}
