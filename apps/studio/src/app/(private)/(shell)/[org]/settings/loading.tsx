import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { OrganizationSettingsPageSkeleton } from "@/module/organizations/organizations.skeletons";

/** Keep the settings route's first paint aligned with its loaded page. */
export default function OrganizationSettingsLoading() {
  return (
    <DelayedPageLoading
      fallback={<OrganizationSettingsPageSkeleton slug="organization" />}
    />
  );
}
