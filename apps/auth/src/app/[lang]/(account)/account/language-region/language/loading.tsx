import {
  AuthAccountRegionalFormSkeleton,
  getRegionalFormSectionCopy,
} from "@modules/regional-preferences"

export default async function AuthAccountLanguageRegionLanguageLoading() {
  const copy = await getRegionalFormSectionCopy("language")
  return (
    <AuthAccountRegionalFormSkeleton
      description={copy.description}
      section="language"
      title={copy.title}
    />
  )
}
