"use client"

import { AuthSessionEndedNotice } from "@modules/auth"
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
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { Link2, MailIcon, Unlink2 } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import {
  hasNewLinkedAccount,
  linkAttemptKey,
  parseLinkAttempt,
} from "../../utils/connected-accounts.link-attempt"
import {
  classifyConnectedAccountLinkCallbackError,
  connectedAccountLinkCallbackMessageKey,
  isConnectedAccountLinkCallbackSuccess,
} from "../../utils/connected-accounts.oauth-link-callback-error"
import { canDisconnectLinkedSignInAccount } from "../../utils/connected-accounts.unlink-guard"
import {
  ACTIVE_SIGN_IN_OAUTH_PROVIDERS,
  CONNECTED_ACCOUNT_PROVIDER_LABELS,
} from "../../utils/constants/connected-accounts.constants.providers"
import type { LinkedConnectedAccount } from "../../utils/serialization/connected-accounts.serialize.linked-accounts"
import type { ConnectedAccountProvider } from "../../utils/types/connected-accounts.types.providers"
import { useConnectedAccountsApi } from "../hooks/connected-accounts.accounts.hooks"
import { connectedAccountsLayout } from "./connected-accounts.connected-accounts-layout"
import { ConnectedAccountsLoadingSkeleton } from "./connected-accounts.connected-accounts-skeleton"
import { SecurityGithubIcon } from "./icons/connected-accounts.github-icon"
import { SecurityGoogleIcon } from "./icons/connected-accounts.google-icon"

type Account = LinkedConnectedAccount
type Provider = ConnectedAccountProvider

export function SecurityConnectedAccountsScreen() {
  const t = useTranslations("ui")

  const format = useFormatter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const {
    data: accounts = [],
    isPending: accountsPending,
    error: accountsError,
    refetch: refetchAccounts,
  } = useConnectedAccountsApi.useList(session?.user.id)
  const {
    data: inventoryResponse,
    isPending: inventoryPending,
    error: inventoryError,
    refetch: refetchInventory,
  } = useConnectedAccountsApi.useInventory(session?.user.id)
  const unlinkAccount = useConnectedAccountsApi.useUnlink(session?.user.id)
  const linkAccount = useConnectedAccountsApi.useLink()
  const loading =
    sessionPending ||
    (Boolean(session?.user.id) && (accountsPending || inventoryPending))
  const error =
    accountsError ||
    inventoryError ||
    (inventoryResponse && inventoryResponse.status !== "success")
      ? t("operationFailed")
      : undefined
  const inventory =
    inventoryResponse?.status === "success" ? inventoryResponse.data : undefined
  const inventoryProviders =
    inventory?.oauth.map((entry) => ({
      configured: entry.configured,
      id: entry.id,
      label: CONNECTED_ACCOUNT_PROVIDER_LABELS[entry.id],
    })) ?? []
  const lastLinkedSignInAccount = !canDisconnectLinkedSignInAccount(accounts)
  const [pending, setPending] = useState<string | null>(null)
  const [selected, setSelected] = useState<Account | null>(null)
  function load() {
    void refetchAccounts()
    void refetchInventory()
  }
  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has("link_result")) return
    const linkResult = url.searchParams.get("link_result")
    const callbackError = url.searchParams.get("error")
    if (
      isConnectedAccountLinkCallbackSuccess(linkResult, callbackError) &&
      sessionPending
    )
      return
    let attempt: ReturnType<typeof parseLinkAttempt> = null
    try {
      attempt = parseLinkAttempt(window.sessionStorage.getItem(linkAttemptKey))
      window.sessionStorage.removeItem(linkAttemptKey)
    } catch {
      // An unavailable storage area cannot establish a link attempt.
    }
    if (isConnectedAccountLinkCallbackSuccess(linkResult, callbackError)) {
      refetchAccounts()
        .then((result) => {
          const confirmed =
            !result.error &&
            hasNewLinkedAccount(attempt, session?.user.id, result.data ?? [])
          toastManager.add({
            title: t(
              confirmed ? "accountConnected" : "accountLinkProviderError"
            ),
            type: confirmed ? "success" : "error",
          })
        })
        .catch(() => {
          toastManager.add({
            title: t("accountLinkProviderError"),
            type: "error",
          })
        })
    } else {
      const kind = classifyConnectedAccountLinkCallbackError(callbackError)
      const messageKey = connectedAccountLinkCallbackMessageKey[kind]
      toastManager.add({ title: t(messageKey), type: "error" })
    }
    url.searchParams.delete("link_result")
    url.searchParams.delete("error")
    url.searchParams.delete("error_description")
    window.history.replaceState(window.history.state, "", url.toString())
  }, [refetchAccounts, session?.user.id, sessionPending, t])

  async function connect(provider: Provider) {
    setPending(provider)
    try {
      const callbackURL = new URL(
        window.location.pathname,
        window.location.origin
      )
      const errorURL = new URL(callbackURL)
      callbackURL.searchParams.set("link_result", "success")
      errorURL.searchParams.set("link_result", "error")
      await toastManager.promise(
        (async () => {
          if (!session?.user.id) throw new Error("Sign in first.")
          window.sessionStorage.setItem(
            linkAttemptKey,
            JSON.stringify({
              userId: session.user.id,
              provider,
              existingIds: accounts.map((account) => account.id),
            })
          )
          await linkAccount.mutateAsync({
            provider,
            callbackURL: callbackURL.toString(),
            errorCallbackURL: errorURL.toString(),
          })
        })(),
        {
          loading: t("connectingAccount"),
          success: t("continuingToProvider"),
          error: t("couldNotConnectProvider"),
        }
      )
    } catch {
      try {
        window.sessionStorage.removeItem(linkAttemptKey)
      } catch {}
    } finally {
      setPending(null)
    }
  }

  async function disconnect() {
    if (!selected || pending || lastLinkedSignInAccount) return
    setPending(selected.id)
    try {
      await toastManager.promise(
        (async () => {
          await unlinkAccount.mutateAsync(selected.id)
        })(),
        {
          loading: t("disconnectingAccount"),
          success: t("accountDisconnected"),
          error: t("couldNotDisconnectProvider"),
        }
      )
      setSelected(null)
    } catch {
      /* The toast reports the error. */
    } finally {
      setPending(null)
    }
  }

  return (
    <>
      {loading ? (
        <ConnectedAccountsLoadingSkeleton />
      ) : error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
          >
            {t("tryAgain")}
          </Button>
        </div>
      ) : !session?.user ? (
        <AuthSessionEndedNotice />
      ) : (
        <div className={connectedAccountsLayout.list}>
          <div className={connectedAccountsLayout.row}>
            <div className="flex min-w-0 items-center gap-3">
              <MailIcon className="size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">
                  {t("emailMagicLink")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user.email ?? t("accountEmail")}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{t("signInMethod")}</Badge>
          </div>
          {inventoryProviders.map(({ id, label, configured }) => {
            const BrandIcon =
              id === "github" ? SecurityGithubIcon : SecurityGoogleIcon
            const linked = accounts.filter(
              (account) => account.providerId === id
            )
            if (linked.length)
              return linked.map((account, index) => (
                <div key={account.id} className={connectedAccountsLayout.row}>
                  <div className="flex items-center gap-3">
                    <BrandIcon className="size-5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        {label}
                        {linked.length > 1 ? ` (${index + 1})` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("connected")}{" "}
                        {format.dateTime(
                          new Date(account.createdAt),
                          "dateTime"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={Boolean(pending) || lastLinkedSignInAccount}
                      title={
                        lastLinkedSignInAccount
                          ? t("cannotDisconnectLastSignInMethod")
                          : undefined
                      }
                      onClick={() => setSelected(account)}
                    >
                      {t("disconnect")}
                    </Button>
                    <Badge variant="success">{t("connected")}</Badge>
                  </div>
                </div>
              ))
            return (
              <div key={id} className={connectedAccountsLayout.row}>
                <div className="flex items-center gap-3">
                  <BrandIcon className="size-5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {configured ? t("notConnected") : t("notConfigured")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!configured || Boolean(pending)}
                    onClick={() => void connect(id)}
                  >
                    {pending === id ? <Spinner /> : <Link2 />}{" "}
                    {pending === id ? t("connecting") : t("connect")}
                  </Button>
                </div>
              </div>
            )
          })}
          {accounts
            .filter(
              (account) =>
                !ACTIVE_SIGN_IN_OAUTH_PROVIDERS.some(
                  (providerId) => providerId === account.providerId
                )
            )
            .map((account) => (
              <div key={account.id} className={connectedAccountsLayout.row}>
                <span className="font-medium text-foreground">
                  {account.providerId}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Boolean(pending) || lastLinkedSignInAccount}
                    title={
                      lastLinkedSignInAccount
                        ? t("cannotDisconnectLastSignInMethod")
                        : undefined
                    }
                    onClick={() => setSelected(account)}
                  >
                    {t("disconnect")}
                  </Button>
                  <Badge variant="success">{t("connected")}</Badge>
                </div>
              </div>
            ))}
        </div>
      )}
      <AlertDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !pending) setSelected(null)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("disconnectAccountTitle", {
                provider:
                  selected?.providerId === "github"
                    ? "GitHub"
                    : selected?.providerId === "google"
                      ? "Google"
                      : t("account"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("disconnectDescription")}
              {selected
                ? ` ${t("connectedDate", { date: format.dateTime(new Date(selected.createdAt), "dateTime") })}`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={Boolean(pending)} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button
              variant="destructive"
              disabled={Boolean(pending)}
              onClick={() => void disconnect()}
            >
              {pending ? <Spinner /> : <Unlink2 />}{" "}
              {pending ? t("disconnecting") : t("disconnect")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
