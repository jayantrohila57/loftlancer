import { SettingsSectionShell } from "@/module/settings/settings.section";
import { AccountSettingsSkeleton } from "@/module/settings/settings.skeleton";

export default function Loading() {
  return (
    <SettingsSectionShell
      title="Danger zone"
      description="Export your data or anonymize your profile and end access."
    >
      <div className="space-y-4">
        <AccountSettingsSkeleton />
        <AccountSettingsSkeleton />
      </div>
    </SettingsSectionShell>
  );
}
