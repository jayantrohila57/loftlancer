import {
  AuthAccountRegionalOverviewSkeleton,
  getRegionalOverviewSkeletonCopy,
} from "@modules/regional-preferences"

export default async function AuthAccountLanguageRegionLoading() {
  const copy = await getRegionalOverviewSkeletonCopy()
  return <AuthAccountRegionalOverviewSkeleton {...copy} />
}
