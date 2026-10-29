import { AccountDeletePanel } from "./settings.delete.panel";
import { AccountExportPanel } from "./settings.export.panel";
import { SettingsSectionShell } from "./settings.section";

export function DangerSettingsView({ email }: { email: string }) {
  return (
    <SettingsSectionShell
      title="Danger zone"
      description="Export your data or anonymize your profile and end access."
    >
      <div className="flex flex-col gap-4">
        <AccountExportPanel />
        <AccountDeletePanel email={email} />
      </div>
    </SettingsSectionShell>
  );
}
