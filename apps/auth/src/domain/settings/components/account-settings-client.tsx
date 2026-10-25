"use client";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@loftlancer/ui/alert-dialog";
import { isGoogleSignInEnabled, landingUrl } from "@loftlancer/ui/auth-links";
import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { GoogleMark } from "@loftlancer/ui/patterns/auth-5";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@loftlancer/ui/patterns/unsaved-changes-page-guard";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { Spinner } from "@loftlancer/ui/spinner";
import { routes } from "@loftlancer/ui/studio-routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRoundIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import {
  SettingsField,
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
  settingsControlWidthClass,
} from "@/components/patterns/settings-layout";
import {
  SettingsTabs,
  SettingsTabsList,
  SettingsTabsPanel,
  SettingsTabsTab,
} from "@/components/patterns/settings-tabs";
import {
  linkSocialAccount,
  listAuthSessions,
  performSignOut,
  revokeAuthSession,
  revokeOtherAuthSessions,
  unlinkProviderAccount,
  updateProfile,
  useSession,
} from "@/domain/auth/lib/auth-actions";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";
import {
  type AuthSessionRow,
  SessionsList,
} from "@/domain/settings/components/sessions-list";
import { initialsFromLabel } from "@/lib/initials";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { studioDashboardPath } from "@/lib/studio-url";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";
import { AccountSettingsSkeleton } from "./account-settings-skeleton";

const ACCOUNT_TABS = [
  "profile",
  "sessions",
  "accounts",
  "export",
  "delete",
] as const;

type AccountTab = (typeof ACCOUNT_TABS)[number];

function readTabFromSearch(param: string | null): AccountTab {
  return ACCOUNT_TABS.includes(param as AccountTab)
    ? (param as AccountTab)
    : "profile";
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AccountSettingsClient({
  section: forcedSection,
}: {
  section?: AccountTab;
} = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { data: session, isPending, error, refetch } = useSession();
  const user = session?.user;
  const sessionToken = session?.session?.token;

  const [activeTab, setActiveTabState] = useState<AccountTab>("profile");
  const tabFromUrl = searchParams.get("tab");
  const useRouteSections = forcedSection !== undefined;

  useEffect(() => {
    if (useRouteSections) return;
    setActiveTabState(readTabFromSearch(tabFromUrl));
  }, [tabFromUrl, useRouteSections]);

  const setActiveTab = useCallback((tab: AccountTab) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setAvatarUrl(user.image ?? "");
    setProfileDirty(false);
  }, [user]);

  const activeSection = forcedSection ?? activeTab;
  const connectedQuery = useQuery({
    ...trpc.account.listConnectedAccounts.queryOptions(),
    enabled: activeSection === "accounts",
  });
  const sidebarContext = useQuery(trpc.sidebar.navigator.queryOptions());
  const deleteBlockersQuery = useQuery({
    ...trpc.account.getDeleteBlockers.queryOptions(),
    enabled: activeSection === "delete",
  });
  const exportMutation = useMutation(trpc.account.exportData.mutationOptions());

  const [providerPending, setProviderPending] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AuthSessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(
    () => forcedSection === "sessions",
  );
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokeToken, setRevokeToken] = useState<string | null>(null);
  const [revokeOthersOpen, setRevokeOthersOpen] = useState(false);
  const [revokePending, setRevokePending] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const rows = await listAuthSessions();
      setSessions(rows as AuthSessionRow[]);
    } catch (err) {
      setSessionsError(
        err instanceof Error ? err.message : "Could not load sessions",
      );
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const tab = forcedSection ?? activeTab;
    if (tab === "sessions") {
      void loadSessions();
    }
  }, [forcedSection, activeTab, loadSessions]);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const softDeleteMutation = useMutation(
    trpc.account.softDelete.mutationOptions({
      onSuccess: async () => {
        const landing = new URL(landingUrl());
        landing.searchParams.set("notice", "account-deleted");
        await performSignOut({
          queryClient,
          router,
          returnTo: landing.toString(),
        });
      },
      onError: (err) => {
        toast.error(err.message ?? "Could not delete account");
      },
    }),
  );

  const profileSaveMutation = useMutation({
    mutationFn: async () => {
      await updateProfile({
        name: name.trim(),
        image: avatarUrl.trim() || undefined,
      });
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      setProfileDirty(false);
      await refetch();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Could not update profile");
    },
  });

  const canProfile = useCan(accountSettingsActions.profile);
  const canSessions = useCan(accountSettingsActions.sessions);
  const canAccounts = useCan(accountSettingsActions.accounts);
  const canExport = useCan(accountSettingsActions.export);
  const canDelete = useCan(accountSettingsActions.delete);

  const deletePhrase = user?.email ?? "";
  const canDeleteAccount = deleteBlockersQuery.data?.data.canDelete ?? false;
  const soleOwnerOrgs =
    deleteBlockersQuery.data?.data.soleOwnerOrganizations ?? [];

  const connectedAccounts = connectedQuery.data?.data ?? [];
  const canUnlinkAny = connectedAccounts.length > 1;
  /**
   * Providers Better Auth is configured for are connectable: GitHub always,
   * Google when configured (#359). Email + password is disabled (#373), so a
   * legacy credential row can only be disconnected.
   */
  const linkable = [
    { key: "github" as const, label: "GitHub" },
    ...(isGoogleSignInEnabled()
      ? [{ key: "google" as const, label: "Google" }]
      : []),
  ];
  const linkableKeys = new Set<string>(linkable.map((p) => p.key));
  const providerRows = [
    ...linkable.map((p) => ({
      key: p.key,
      label: p.label,
      icon: p.key,
      connectable: true,
      account: connectedAccounts.find((a) => a.providerId === p.key),
    })),
    ...connectedAccounts
      .filter((a) => !linkableKeys.has(a.providerId))
      .map((a) => ({
        key: a.id,
        label:
          a.providerId === "credential"
            ? "Password (sign-in disabled)"
            : a.providerId.charAt(0).toUpperCase() + a.providerId.slice(1),
        icon: "key" as const,
        connectable: false,
        account: a,
      })),
  ];

  const orgLinkEnabled = isOrganizationsEnabledOnClient();
  const organizationSlug = sidebarContext.data?.organizationSlug;

  if (isPending) {
    return (
      <DelayedPageLoading
        fallback={<AccountSettingsSkeleton />}
        onRetry={() => void refetch()}
      />
    );
  }

  if (error || !user) {
    return (
      <ErrorState
        title="Could not load account"
        description="Sign in again to manage your settings."
        onRetry={() => refetch()}
      />
    );
  }

  const handleExportDownload = async () => {
    try {
      const payload = await exportMutation.mutateAsync();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadJson(`loftlancer-export-${stamp}.json`, payload);
      toast.success("Export downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export data");
    }
  };

  const handleRevokeSession = async (token: string) => {
    setRevokePending(true);
    try {
      await revokeAuthSession(token);
      toast.success("Session revoked");
      setRevokeToken(null);
      await loadSessions();
      if (token === sessionToken) {
        void performSignOut({ queryClient, router });
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not revoke session",
      );
    } finally {
      setRevokePending(false);
    }
  };

  const handleRevokeOthers = async () => {
    setRevokePending(true);
    try {
      await revokeOtherAuthSessions();
      toast.success("Other sessions revoked");
      setRevokeOthersOpen(false);
      await loadSessions();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not revoke sessions",
      );
    } finally {
      setRevokePending(false);
    }
  };

  const handleLinkProvider = async (provider: "github" | "google") => {
    setProviderPending(provider);
    try {
      // Redirects to the provider on success; keep the spinner until navigation.
      await linkSocialAccount(provider);
    } catch (err) {
      setProviderPending(null);
      toast.error(
        err instanceof Error ? err.message : `Could not link ${provider}`,
      );
    }
  };

  /** `id` is the Better Auth account row id (what /unlink-account expects). */
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disconnect");
    } finally {
      setProviderPending(null);
    }
  };

  const resetProfileFields = () => {
    setName(user.name ?? "");
    setAvatarUrl(user.image ?? "");
    setProfileDirty(false);
  };

  return (
    <UnsavedChangesPageGuard
      isDirty={profileDirty}
      onDiscard={resetProfileFields}
    >
      {({ guardNavigation }) => (
        <>
          <SettingsTabs
            value={useRouteSections ? (forcedSection as AccountTab) : activeTab}
            onValueChange={(value) => {
              if (useRouteSections) return;
              if (!value || value === activeTab) return;
              guardNavigation(() => setActiveTab(value as AccountTab));
            }}
          >
            {!useRouteSections ? (
              <SettingsTabsList>
                {canProfile.allowed ? (
                  <SettingsTabsTab value="profile" icon="user">
                    Profile
                  </SettingsTabsTab>
                ) : null}
                {canSessions.allowed ? (
                  <SettingsTabsTab value="sessions" icon="lock">
                    Sessions
                  </SettingsTabsTab>
                ) : null}
                {canAccounts.allowed ? (
                  <SettingsTabsTab value="accounts" icon="github">
                    Connected accounts
                  </SettingsTabsTab>
                ) : null}
                {canExport.allowed ? (
                  <SettingsTabsTab value="export" icon="archiveRestore">
                    Export
                  </SettingsTabsTab>
                ) : null}
                {canDelete.allowed ? (
                  <SettingsTabsTab value="delete" icon="danger">
                    Delete account
                  </SettingsTabsTab>
                ) : null}
              </SettingsTabsList>
            ) : null}

            <SettingsTabsPanel value="profile" className="min-w-0">
              <SettingsPanel>
                <SettingsField label="Avatar" description="Image URL (HTTPS).">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Avatar className="size-12 shrink-0">
                      <AvatarImage src={avatarUrl || undefined} alt="" />
                      <AvatarFallback>
                        {initialsFromLabel(name || user.email, "US")}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setProfileDirty(true);
                      }}
                      placeholder="https://…"
                      className={settingsControlWidthClass}
                    />
                  </div>
                </SettingsField>
                <SettingsField
                  label="Display name"
                  description="Shown in the UI."
                >
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setProfileDirty(true);
                    }}
                    className={settingsControlWidthClass}
                  />
                </SettingsField>
                <SettingsRow
                  label="Email"
                  description="Sign-in email (read-only)."
                >
                  <span className="text-sm">{user.email}</span>
                </SettingsRow>
                <SettingsRow label="Save" description="Apply profile changes.">
                  <SubmitButton
                    type="button"
                    size="sm"
                    className="w-fit"
                    isLoading={profileSaveMutation.isPending}
                    loadingLabel="Saving…"
                    disabled={!profileDirty || !name.trim()}
                    onClick={() => profileSaveMutation.mutate()}
                  >
                    Save changes
                  </SubmitButton>
                </SettingsRow>
              </SettingsPanel>

              {orgLinkEnabled ? (
                <SettingsPanel className="mt-2">
                  <SettingsSectionHeader
                    title="Organization"
                    description="Organization members and profile."
                    icon="organization"
                  />
                  <SettingsRow
                    label="Organization"
                    description="Managed in the Organizations module."
                  >
                    <Button
                      type="button"
                      size="sm"
                      className="w-fit gap-2"
                      render={
                        <a
                          href={studioDashboardPath(
                            organizationSlug
                              ? routes.orgSection(organizationSlug, "settings")
                              : routes.home(),
                          )}
                          rel="noopener noreferrer"
                        >
                          <AppIcon name="settings" className="text-current" />
                          {organizationSlug
                            ? "Organization settings"
                            : "Choose an organization"}
                        </a>
                      }
                    />
                  </SettingsRow>
                </SettingsPanel>
              ) : null}
            </SettingsTabsPanel>

            <SettingsTabsPanel value="sessions" className="min-w-0">
              <PermissionGate action={accountSettingsActions.sessions}>
                <SettingsPanel>
                  <SettingsRow
                    label="Revoke others"
                    description="Sign out every device except this one."
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-fit"
                      disabled={sessions.length <= 1 || revokePending}
                      onClick={() => setRevokeOthersOpen(true)}
                    >
                      Revoke all other sessions
                      {sessions.length > 1 ? (
                        <span className="text-muted-foreground tabular-nums">
                          {sessions.length - 1}
                        </span>
                      ) : null}
                    </Button>
                  </SettingsRow>
                  <div className="p-4">
                    <SessionsList
                      sessions={sessions}
                      currentToken={sessionToken}
                      pendingToken={revokePending ? revokeToken : null}
                      disabled={revokePending}
                      isLoading={sessionsLoading}
                      isError={Boolean(sessionsError) && sessions.length === 0}
                      errorDescription={sessionsError ?? undefined}
                      onRevoke={(token) => setRevokeToken(token)}
                    />
                  </div>
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="accounts" className="min-w-0">
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
                          <li
                            key={row.key}
                            className="flex h-16 items-center gap-3 px-4"
                          >
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
                                <p className="font-medium text-sm">
                                  {row.label}
                                </p>
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
                                    Linked{" "}
                                    <LocalDateTime
                                      value={row.account.createdAt}
                                    />
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
                                <span
                                  className={busy ? "invisible" : undefined}
                                >
                                  Disconnect
                                </span>
                                {busy ? (
                                  <Spinner className="absolute size-4" />
                                ) : null}
                              </Button>
                            ) : row.connectable ? (
                              <Button
                                type="button"
                                size="sm"
                                className="relative w-24 shrink-0"
                                disabled={connectedQuery.isLoading || busy}
                                onClick={() =>
                                  void handleLinkProvider(
                                    row.key as "github" | "google",
                                  )
                                }
                              >
                                <span
                                  className={busy ? "invisible" : undefined}
                                >
                                  Connect
                                </span>
                                {busy ? (
                                  <Spinner className="absolute size-4" />
                                ) : null}
                              </Button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {!connectedQuery.isLoading && !canUnlinkAny ? (
                    <p className="border-border/60 border-t px-4 py-2 text-muted-foreground text-xs">
                      You need at least one sign-in method, so your only
                      connected account can't be disconnected.
                    </p>
                  ) : null}
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="export" className="min-w-0">
              <PermissionGate action={accountSettingsActions.export}>
                <SettingsPanel>
                  <SettingsSectionHeader
                    title="Export my data"
                    description="Download a JSON copy of data you own."
                    icon="archiveRestore"
                  />
                  <SettingsRow
                    label="Download"
                    description="Includes projects, environments, variable keys, audit log, and profile metadata. Secret values are excluded."
                  >
                    <SubmitButton
                      type="button"
                      size="sm"
                      className="w-fit gap-2"
                      isLoading={exportMutation.isPending}
                      loadingLabel="Preparing…"
                      onClick={() => void handleExportDownload()}
                    >
                      <AppIcon name="archiveRestore" className="text-current" />
                      Download JSON
                    </SubmitButton>
                  </SettingsRow>
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>

            <SettingsTabsPanel value="delete" className="min-w-0">
              <PermissionGate action={accountSettingsActions.delete}>
                <SettingsPanel className="border-destructive/32 bg-destructive/4">
                  <SettingsSectionHeader
                    title="Delete account"
                    description="Anonymizes your profile and revokes sessions. Organization and project records remain."
                    icon="danger"
                  />
                  {!canDeleteAccount && soleOwnerOrgs.length > 0 ? (
                    <SettingsRow
                      label="Ownership"
                      description="Transfer ownership before deleting."
                    >
                      <ul className="max-w-md space-y-1 text-end text-muted-foreground text-xs">
                        {soleOwnerOrgs.map((org) => (
                          <li key={org.organizationId}>
                            Sole owner of <strong>{org.name}</strong> (
                            {org.slug})
                          </li>
                        ))}
                      </ul>
                    </SettingsRow>
                  ) : null}
                  <SettingsRow
                    label="Delete"
                    description="Type your email to confirm. Your profile will be anonymized; organization records and activity history remain."
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-fit"
                      disabled={
                        !canDeleteAccount || softDeleteMutation.isPending
                      }
                      onClick={() => {
                        setDeleteOpen(true);
                      }}
                    >
                      Delete account
                    </Button>
                  </SettingsRow>
                </SettingsPanel>
              </PermissionGate>
            </SettingsTabsPanel>
          </SettingsTabs>

          <AlertDialog
            open={revokeToken !== null}
            onOpenChange={(open) => {
              if (!open) setRevokeToken(null);
            }}
          >
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke session</AlertDialogTitle>
                <AlertDialogDescription>
                  This device will be signed out immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose
                  render={<Button variant="ghost" disabled={revokePending} />}
                >
                  Cancel
                </AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={revokePending || !revokeToken}
                  onClick={() => {
                    if (revokeToken) void handleRevokeSession(revokeToken);
                  }}
                >
                  {revokePending ? <Spinner className="size-3.5" /> : null}
                  Revoke
                </Button>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>

          <AlertDialog
            open={revokeOthersOpen}
            onOpenChange={setRevokeOthersOpen}
          >
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke other sessions</AlertDialogTitle>
                <AlertDialogDescription>
                  Every device except this browser will be signed out.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose
                  render={<Button variant="ghost" disabled={revokePending} />}
                >
                  Cancel
                </AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={revokePending}
                  onClick={() => void handleRevokeOthers()}
                >
                  {revokePending ? <Spinner className="size-3.5" /> : null}
                  Revoke all others
                </Button>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete account"
            description="Your name, email, and avatar will be anonymized, and your sessions revoked. Your organization and project records and audit history remain; Loftlancer does not currently set an automatic removal date for them. You cannot restore this profile yourself."
            confirmLabel="Delete account"
            confirmText={deletePhrase}
            variant="destructive"
            onConfirm={async () => {
              await softDeleteMutation.mutateAsync();
            }}
            isPending={softDeleteMutation.isPending}
          />
        </>
      )}
    </UnsavedChangesPageGuard>
  );
}
