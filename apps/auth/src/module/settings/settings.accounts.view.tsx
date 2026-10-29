import { AccountsSettingsPanel } from "./settings.accounts.panel";
import { SettingsSectionShell } from "./settings.section";
import type { SettingsConnectedAccounts } from "./settings.types";

export function AccountsSettingsView({
  accounts,
}: {
  accounts: SettingsConnectedAccounts;
}) {
  return (
    <SettingsSectionShell
      title="Connected accounts"
      description="GitHub and other providers used to sign in."
    >
      <AccountsSettingsPanel initialAccounts={accounts} />
    </SettingsSectionShell>
  );
}
