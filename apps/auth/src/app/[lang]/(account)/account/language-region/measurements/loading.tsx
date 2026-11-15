import {
  AuthAccountRegionalFormSkeleton,
  getRegionalFormSectionCopy,
} from "@modules/regional-preferences"

export default async function AuthAccountLanguageRegionMeasurementsLoading() {
  const copy = await getRegionalFormSectionCopy("measurements")
  return (
    <AuthAccountRegionalFormSkeleton
      description={copy.description}
      section="measurements"
      title={copy.title}
    />
  )
}
