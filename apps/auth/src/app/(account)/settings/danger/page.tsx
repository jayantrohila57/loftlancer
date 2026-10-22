import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(account)/settings/_components/settings-section-shell";
import { AccountSettingsClient } from "@/domain/settings/components/account-settings-client";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Danger zone",
  description: "Export or delete your account.",
};

export default async function DangerZoneSettingsPage() {
  await guardPageAction("profile.view");

  return (
    <SettingsSectionShell
      title="Danger zone"
      description="Export your data or permanently delete your account."
    >
      <div className="flex flex-col gap-4">
        <Suspense
          fallback={
            <DelayedPageLoading fallback={<AccountSettingsSkeleton />} />
          }
        >
          <AccountSettingsClient section="export" />
        </Suspense>
        <Suspense
          fallback={
            <DelayedPageLoading fallback={<AccountSettingsSkeleton />} />
          }
        >
          <AccountSettingsClient section="delete" />
        </Suspense>
      </div>
    </SettingsSectionShell>
  );
}
