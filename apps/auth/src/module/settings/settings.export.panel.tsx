"use client";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { useMutation } from "@tanstack/react-query";
import { AppIcon } from "@/components/patterns/app-icon";
import { PermissionGate } from "@/domain/permissions/components/permission-gate";
import { accountSettingsActions } from "@/domain/permissions/org-section-actions";
import { toast } from "@/lib/toast";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/module/settings/settings.layout";
import { trpc } from "@/utils/trpc";

export function AccountExportPanel() {
  const exportMutation = useMutation(trpc.account.exportData.mutationOptions());
  const handleExportDownload = async () => {
    try {
      const payload = await exportMutation.mutateAsync();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `loftlancer-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not export data",
      );
    }
  };
  return (
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
  );
}
