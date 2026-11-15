import {
  AuthAccountRegionalFormSkeleton,
  getRegionalFormSectionCopy,
} from "@modules/regional-preferences"

export default async function AuthAccountLanguageRegionRegionLoading() {
  const copy = await getRegionalFormSectionCopy("region")
  return (
    <AuthAccountRegionalFormSkeleton
      description={copy.description}
      section="region"
      title={copy.title}
    />
  )
}
