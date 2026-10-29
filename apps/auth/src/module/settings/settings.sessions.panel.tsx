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
import { Button } from "@loftlancer/ui/button";
import { Spinner } from "@loftlancer/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { performSignOut } from "@/domain/auth/lib/auth-actions";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";
import { toast } from "@/lib/toast";
import { SettingsPanel, SettingsRow } from "@/module/settings/settings.layout";
import {
  type AuthSessionRow,
  SessionsList,
} from "@/module/settings/settings.sessions.list";
import { ErrorState } from "@/shared/components/shared.error-state";
import {
  listAuthSessions,
  revokeAuthSession,
  revokeOtherAuthSessions,
} from "./settings.sessions.api";

export function SessionsSettingsPanel({
  initialSessions,
  currentToken,
}: {
  initialSessions: AuthSessionRow[];
  currentToken: string;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokeToken, setRevokeToken] = useState<string | null>(null);
  const [revokeOthersOpen, setRevokeOthersOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  async function reloadSessions() {
    setLoading(true);
    setError(null);
    try {
      setSessions(await listAuthSessions());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sessions");
    } finally {
      setLoading(false);
    }
  }
  async function revokeSession(token: string) {
    setPending(true);
    try {
      await revokeAuthSession(token);
      toast.success("Session revoked");
      setRevokeToken(null);
      if (token === currentToken) await performSignOut({ queryClient, router });
      else await reloadSessions();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not revoke session",
      );
    } finally {
      setPending(false);
    }
  }
  async function revokeOthers() {
    setPending(true);
    try {
      await revokeOtherAuthSessions();
      toast.success("Other sessions revoked");
      setRevokeOthersOpen(false);
      await reloadSessions();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not revoke sessions",
      );
    } finally {
      setPending(false);
    }
  }

  return (
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
            disabled={sessions.length <= 1 || pending}
            onClick={() => setRevokeOthersOpen(true)}
          >
            Revoke all other sessions{" "}
            {sessions.length > 1 ? (
              <span className="text-muted-foreground tabular-nums">
                {sessions.length - 1}
              </span>
            ) : null}
          </Button>
        </SettingsRow>
        <div className="p-4">
          {error ? (
            <ErrorState
              title="Could not load sessions"
              description={error}
              onRetry={() => void reloadSessions()}
            />
          ) : (
            <SessionsList
              sessions={sessions}
              currentToken={currentToken}
              pendingToken={pending ? revokeToken : null}
              disabled={pending}
              isLoading={loading}
              onRevoke={setRevokeToken}
            />
          )}
        </div>
      </SettingsPanel>
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
              render={<Button variant="ghost" disabled={pending} />}
            >
              Cancel
            </AlertDialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || !revokeToken}
              onClick={() => {
                if (revokeToken) void revokeSession(revokeToken);
              }}
            >
              {pending ? <Spinner className="size-3.5" /> : null}Revoke
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
      <AlertDialog open={revokeOthersOpen} onOpenChange={setRevokeOthersOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke other sessions</AlertDialogTitle>
            <AlertDialogDescription>
              Every device except this browser will be signed out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="ghost" disabled={pending} />}
            >
              Cancel
            </AlertDialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => void revokeOthers()}
            >
              {pending ? <Spinner className="size-3.5" /> : null}Revoke all
              others
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </PermissionGate>
  );
}
