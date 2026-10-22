import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { SettingsPanelSkeleton } from "@loftlancer/ui/patterns/settings-panel-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(account)/settings/_components/settings-section-shell";
import { AccountSettingsClient } from "@/domain/settings/components/account-settings-client";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your display name and avatar.",
};

export default async function ProfileSettingsPage() {
  await guardPageAction("profile.view");

  return (
    <SettingsSectionShell
      title="Profile"
      description="Your name and avatar shown across Loftlancer."
      showStats
    >
      <Suspense
        fallback={
          <DelayedPageLoading fallback={<SettingsPanelSkeleton rows={4} />} />
        }
      >
        <AccountSettingsClient section="profile" />
      </Suspense>
    </SettingsSectionShell>
  );
}
