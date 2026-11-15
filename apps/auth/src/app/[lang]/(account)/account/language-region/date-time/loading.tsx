import {
  AuthAccountRegionalFormSkeleton,
  getRegionalFormSectionCopy,
} from "@modules/regional-preferences"

export default async function AuthAccountLanguageRegionDateTimeLoading() {
  const copy = await getRegionalFormSectionCopy("date-time")
  return (
    <AuthAccountRegionalFormSkeleton
      description={copy.description}
      section="date-time"
      title={copy.title}
    />
  )
}
