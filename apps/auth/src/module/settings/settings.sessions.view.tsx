import { SettingsSectionShell } from "./settings.section";
import { SessionsSettingsPanel } from "./settings.sessions.panel";
import type { SettingsSessions } from "./settings.types";

export function SessionsSettingsView({
  sessions,
  currentToken,
}: {
  sessions: SettingsSessions;
  currentToken: string;
}) {
  return (
    <SettingsSectionShell
      title="Sessions"
      description="Devices and browsers signed in to your account."
    >
      <SessionsSettingsPanel
        initialSessions={sessions}
        currentToken={currentToken}
      />
    </SettingsSectionShell>
  );
}
