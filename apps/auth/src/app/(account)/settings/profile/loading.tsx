import { SettingsSectionShell } from "@/module/settings/settings.section";
import { AccountSettingsSkeleton } from "@/module/settings/settings.skeleton";

export default function Loading() {
  return (
    <SettingsSectionShell
      title="Profile"
      description="Your name and avatar shown across Loftlancer."
    >
      <AccountSettingsSkeleton />
    </SettingsSectionShell>
  );
}
