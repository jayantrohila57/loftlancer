import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsSectionShell } from "@/app/(account)/settings/_components/settings-section-shell";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";
import { SecuritySettingsPanel } from "@/domain/settings/components/security-settings-panel";
import { guardPageAction } from "@/lib/page-guards";

export const metadata: Metadata = {
  title: "Security",
  description: "Sign-in and account protection.",
};

export default async function SecuritySettingsPage() {
  await guardPageAction("session.list");

  return (
    <SettingsSectionShell
      title="Security"
      description="How you sign in and protect your account."
    >
      <Suspense
        fallback={<DelayedPageLoading fallback={<AccountSettingsSkeleton />} />}
      >
        <SecuritySettingsPanel />
      </Suspense>
    </SettingsSectionShell>
  );
}
