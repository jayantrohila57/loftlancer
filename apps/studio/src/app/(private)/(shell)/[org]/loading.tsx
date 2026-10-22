import { DelayedPageLoading } from "@loftlancer/ui/patterns/delayed-page-loading";
import { OrganizationSectionRouteSkeleton } from "@/domain/organizations/components/skeletons";

export default function OrganizationSlugLoading() {
  return <DelayedPageLoading fallback={<OrganizationSectionRouteSkeleton />} />;
}
