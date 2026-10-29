import { SettingsSectionShell } from "./settings.section";
import { SecuritySettingsPanel } from "./settings.security.panel";

export function SecuritySettingsView({
  email,
  userAgent,
  ipAddress,
}: {
  email: string;
  userAgent: string | null;
  ipAddress: string | null;
}) {
  return (
    <SettingsSectionShell
      title="Security"
      description="How you sign in and protect your account."
    >
      <SecuritySettingsPanel
        email={email}
        userAgent={userAgent}
        ipAddress={ipAddress}
      />
    </SettingsSectionShell>
  );
}
