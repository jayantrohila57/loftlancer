"use client";
import { isGoogleSignInEnabled } from "@loftlancer/ui/auth-links";
import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { GoogleMark } from "@loftlancer/ui/patterns/auth-5";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { Spinner } from "@loftlancer/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";
import { toast } from "@/lib/toast";
import { SettingsPanel } from "@/module/settings/settings.layout";
import { ErrorState } from "@/shared/components/shared.error-state";
import { trpc } from "@/utils/trpc";
import {
  linkSocialAccount,
  unlinkProviderAccount,
} from "./settings.accounts.api";
import type { SettingsConnectedAccounts } from "./settings.types";

export function AccountsSettingsPanel({
  initialAccounts,
}: {
  initialAccounts: SettingsConnectedAccounts;
}) {
  const connectedQuery = useQuery({
    ...trpc.account.listConnectedAccounts.queryOptions(),
    initialData: initialAccounts,
    staleTime: 30_000,
  });
  const [providerPending, setProviderPending] = useState<string | null>(null);
  const connectedAccounts = connectedQuery.data?.data ?? [];
  const canUnlinkAny = connectedAccounts.length > 1;
  const linkable = [
    { key: "github" as const, label: "GitHub" },
    ...(isGoogleSignInEnabled()
      ? [{ key: "google" as const, label: "Google" }]
      : []),
  ];
  const linkableKeys = new Set<string>(
    linkable.map((provider) => provider.key),
  );
  const providerRows = [
    ...linkable.map((provider) => ({
      key: provider.key,
      label: provider.label,
      icon: provider.key,
      connectable: true,
      account: connectedAccounts.find(
        (account) => account.providerId === provider.key,
      ),
    })),
    ...connectedAccounts
      .filter((account) => !linkableKeys.has(account.providerId))
      .map((account) => ({
        key: account.id,
        label:
          account.providerId === "credential"
            ? "Password (sign-in disabled)"
            : account.providerId.charAt(0).toUpperCase() +
              account.providerId.slice(1),
        icon: "key" as const,
        connectable: false,
        account,
      })),
  ];
  const handleLinkProvider = async (provider: "github" | "google") => {
    setProviderPending(provider);
    try {
      await linkSocialAccount(provider);
    } catch (error) {
      setProviderPending(null);
      toast.error(
        error instanceof Error ? error.message : `Could not link ${provider}`,
      );
    }
  };
  const handleUnlinkAccount = async (
    key: string,
    id: string,
    label: string,
  ) => {
    setProviderPending(key);
    try {
      await unlinkProviderAccount(id);
      toast.success(`${label} disconnected`);
      await connectedQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not disconnect",
      );
    } finally {
      setProviderPending(null);
    }
  };
  return (
    <PermissionGate action={accountSettingsActions.accounts}>
      <SettingsPanel>
        {connectedQuery.isError ? (
          <div className="px-4 py-4">
            <ErrorState
              title="Could not load accounts"
              description={connectedQuery.error.message}
              onRetry={() => void connectedQuery.refetch()}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {providerRows.map((row) => {
              const busy = providerPending === row.key;
              return (
                <li key={row.key} className="flex h-16 items-center gap-3 px-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {row.icon === "github" ? (
                      <AppIcon name="github" className="size-4" />
                    ) : row.icon === "google" ? (
                      <GoogleMark aria-hidden className="size-4" />
                    ) : (
                      <KeyRoundIcon
                        aria-hidden
                        className="size-4 text-muted-foreground"
                      />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm">{row.label}</p>
                      {connectedQuery.isLoading ? (
                        <Skeleton className="h-4.5 w-20 rounded-sm" />
                      ) : row.account ? (
                        <Badge variant="success">Connected</Badge>
                      ) : (
                        <Badge variant="outline">Not connected</Badge>
                      )}
                    </div>
                    <p className="truncate text-muted-foreground text-xs">
                      {connectedQuery.isLoading ? (
                        "\u00a0"
                      ) : row.account ? (
                        <>
                          Linked <LocalDateTime value={row.account.createdAt} />
                          {row.account.scope?.trim()
                            ? ` · ${row.account.scope}`
                            : ""}
                        </>
                      ) : row.connectable ? (
                        `Sign in with ${row.label}.`
                      ) : (
                        "\u00a0"
                      )}
                    </p>
                  </div>
                  {row.account ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="relative w-24 shrink-0"
                      disabled={!canUnlinkAny || busy}
                      title={
                        canUnlinkAny
                          ? undefined
                          : "Add another sign-in method before disconnecting your only one."
                      }
                      onClick={() =>
                        void handleUnlinkAccount(
                          row.key,
                          row.account?.id ?? "",
                          row.label,
                        )
                      }
                    >
                      <span className={busy ? "invisible" : undefined}>
                        Disconnect
                      </span>
                      {busy ? <Spinner className="absolute size-4" /> : null}
                    </Button>
                  ) : row.connectable ? (
                    <Button
                      type="button"
                      size="sm"
                      className="relative w-24 shrink-0"
                      disabled={connectedQuery.isLoading || busy}
                      onClick={() =>
                        void handleLinkProvider(row.key as "github" | "google")
                      }
                    >
                      <span className={busy ? "invisible" : undefined}>
                        Connect
                      </span>
                      {busy ? <Spinner className="absolute size-4" /> : null}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {!connectedQuery.isLoading && !canUnlinkAny ? (
          <p className="border-border/60 border-t px-4 py-2 text-muted-foreground text-xs">
            You need at least one sign-in method, so your only connected account
            can't be disconnected.
          </p>
        ) : null}
      </SettingsPanel>
    </PermissionGate>
  );
}
