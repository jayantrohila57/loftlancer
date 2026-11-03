import { DelayedPageLoading } from "@features/patterns/core/client/patterns.delayed-page-loading";
import { OrganizationRouteSkeleton } from "@module/organizations/client/studio/skeletons/client.organization-skeleton";

export default function OrganizationSlugLoading() {
  return <DelayedPageLoading fallback={<OrganizationRouteSkeleton />} />;
}
