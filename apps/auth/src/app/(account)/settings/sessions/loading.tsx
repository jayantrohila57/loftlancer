import { SettingsSectionShell } from "@/module/settings/settings.section";
import { AccountSettingsSkeleton } from "@/module/settings/settings.skeleton";

export default function Loading() {
  return (
    <SettingsSectionShell
      title="Sessions"
      description="Devices and browsers signed in to your account."
    >
      <AccountSettingsSkeleton />
    </SettingsSectionShell>
  );
}
