import {
  AuthAccountRegionalFormSkeleton,
  getRegionalFormSectionCopy,
} from "@modules/regional-preferences"

export default async function AuthAccountLanguageRegionNumbersLoading() {
  const copy = await getRegionalFormSectionCopy("numbers")
  return (
    <AuthAccountRegionalFormSkeleton
      description={copy.description}
      section="numbers"
      title={copy.title}
    />
  )
}
