import { SettingsSectionShell } from "@/module/settings/settings.section";
import { AccountSettingsSkeleton } from "@/module/settings/settings.skeleton";

export default function Loading() {
  return (
    <SettingsSectionShell
      title="Security"
      description="How you sign in and protect your account."
    >
      <AccountSettingsSkeleton />
    </SettingsSectionShell>
  );
}
