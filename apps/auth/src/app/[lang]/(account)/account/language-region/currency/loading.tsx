import {
  AuthAccountRegionalFormSkeleton,
  getRegionalFormSectionCopy,
} from "@modules/regional-preferences"

export default async function AuthAccountLanguageRegionCurrencyLoading() {
  const copy = await getRegionalFormSectionCopy("currency")
  return (
    <AuthAccountRegionalFormSkeleton
      description={copy.description}
      section="currency"
      title={copy.title}
    />
  )
}
