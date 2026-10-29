import { ProfileSettingsForm } from "./settings.profile.form";
import { ProfileOrganizationLink } from "./settings.profile.organization-link";
import { SettingsSectionShell } from "./settings.section";
import type { SettingsProfile } from "./settings.types";

export function ProfileSettingsView({ profile }: { profile: SettingsProfile }) {
  return (
    <SettingsSectionShell
      title="Profile"
      description="Your name and avatar shown across Loftlancer."
    >
      <ProfileSettingsForm initialUser={profile} />
      <ProfileOrganizationLink />
    </SettingsSectionShell>
  );
}
