import { SettingsSectionShell } from "@/module/settings/settings.section";
import { AccountSettingsSkeleton } from "@/module/settings/settings.skeleton";

export default function Loading() {
  return (
    <SettingsSectionShell
      title="Connected accounts"
      description="GitHub and other providers used to sign in."
    >
      <AccountSettingsSkeleton />
    </SettingsSectionShell>
  );
}
