import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { AccountSettingsSkeleton } from "@/domain/settings/components/account-settings-skeleton";

export default function SettingsLoading() {
  return <DelayedPageLoading fallback={<AccountSettingsSkeleton />} />;
}
