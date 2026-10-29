import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { OrganizationSectionRouteSkeleton } from "@/module/organizations/organizations.skeletons";

export default function OrganizationSlugLoading() {
  return <DelayedPageLoading fallback={<OrganizationSectionRouteSkeleton />} />;
}
