"use client";
import { Button } from "@loftlancer/ui/button";
import { routes } from "@loftlancer/ui/studio-routes";
import { useQuery } from "@tanstack/react-query";
import { AppIcon } from "@/components/patterns/app-icon";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { studioDashboardPath } from "@/lib/studio-url";
import { trpc } from "@/utils/trpc";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "./settings.layout";

export function ProfileOrganizationLink() {
  const orgLinkEnabled = isOrganizationsEnabledOnClient();
  const sidebarContext = useQuery({
    ...trpc.sidebar.navigator.queryOptions(),
    enabled: orgLinkEnabled,
  });
  const organizationSlug = sidebarContext.data?.organizationSlug;
  return orgLinkEnabled ? (
    <SettingsPanel className="mt-2">
      <SettingsSectionHeader
        title="Organization"
        description="Organization members and profile."
        icon="organization"
      />
      <SettingsRow
        label="Organization"
        description="Managed in the Organizations module."
      >
        <Button
          type="button"
          size="sm"
          className="w-fit gap-2"
          render={
            <a
              href={studioDashboardPath(
                organizationSlug
                  ? routes.orgSection(organizationSlug, "settings")
                  : routes.home(),
              )}
              rel="noopener noreferrer"
            >
              <AppIcon name="settings" className="text-current" />
              {organizationSlug
                ? "Organization settings"
                : "Choose an organization"}
            </a>
          }
        />
      </SettingsRow>
    </SettingsPanel>
  ) : null;
}
