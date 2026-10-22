import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(account)/settings/_components/settings-section-shell";
import { AccountSettingsClient } from "@/domain/settings/components/account-settings-client";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Connected accounts",
  description: "OAuth providers linked to your profile.",
};

export default async function AccountsSettingsPage() {
  await guardPageAction("account.list");

  return (
    <SettingsSectionShell
      title="Connected accounts"
      description="GitHub and other providers used to sign in."
    >
      <Suspense
        fallback={<DelayedPageLoading fallback={<AccountSettingsSkeleton />} />}
      >
        <AccountSettingsClient section="accounts" />
      </Suspense>
    </SettingsSectionShell>
  );
}
