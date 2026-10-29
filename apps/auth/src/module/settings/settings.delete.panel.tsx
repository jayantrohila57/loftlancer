"use client";
import { landingUrl } from "@loftlancer/ui/auth-links";
import { Button } from "@loftlancer/ui/button";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { performSignOut } from "@/domain/auth/lib/auth-actions";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";
import { toast } from "@/lib/toast";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/module/settings/settings.layout";
import { ErrorState } from "@/shared/components/shared.error-state";
import { trpc } from "@/utils/trpc";

export function AccountDeletePanel({ email }: { email: string }) {
  const deletePhrase = email;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const deleteBlockersQuery = useQuery(
    trpc.account.getDeleteBlockers.queryOptions(),
  );
  const canDeleteAccount = deleteBlockersQuery.data?.data.canDelete ?? false;
  const soleOwnerOrgs =
    deleteBlockersQuery.data?.data.soleOwnerOrganizations ?? [];
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
      onError: (error) =>
        toast.error(error.message ?? "Could not delete account"),
    }),
  );
  return (
    <>
      <PermissionGate action={accountSettingsActions.delete}>
        <SettingsPanel className="border-destructive/32 bg-destructive/4">
          <SettingsSectionHeader
            title="Delete account"
            description="Anonymizes your profile and revokes sessions. Organization and project records remain."
            icon="danger"
          />
          {deleteBlockersQuery.isError ? (
            <div className="px-4 py-4">
              <ErrorState
                title="Could not check account deletion"
                description="Try again to check whether your account can be deleted."
                onRetry={() => void deleteBlockersQuery.refetch()}
              />
            </div>
          ) : null}
          {deleteBlockersQuery.isLoading ? (
            <p
              className="px-4 py-3 text-muted-foreground text-sm"
              role="status"
            >
              Checking account ownership…
            </p>
          ) : null}
          {!canDeleteAccount && soleOwnerOrgs.length > 0 ? (
            <SettingsRow
              label="Ownership"
              description="Transfer ownership before deleting."
            >
              <ul className="max-w-md space-y-1 text-end text-muted-foreground text-xs">
                {soleOwnerOrgs.map((org) => (
                  <li key={org.organizationId}>
                    Sole owner of <strong>{org.name}</strong> ({org.slug})
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
              disabled={!canDeleteAccount || softDeleteMutation.isPending}
              onClick={() => {
                setDeleteOpen(true);
              }}
            >
              Delete account
            </Button>
          </SettingsRow>
        </SettingsPanel>
      </PermissionGate>
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
  );
}
