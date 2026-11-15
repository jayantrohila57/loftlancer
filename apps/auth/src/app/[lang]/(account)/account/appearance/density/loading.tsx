import {
  AuthAccountAppearanceFormSkeleton,
  getAppearanceFormSectionCopy,
} from "@modules/appearance-preferences"

export default async function AuthAccountAppearanceDensityLoading() {
  const copy = await getAppearanceFormSectionCopy("density")
  return (
    <AuthAccountAppearanceFormSkeleton
      frameDescription={copy.frameDescription}
      frameTitle={copy.frameTitle}
      section="density"
      sectionDescription={copy.sectionDescription}
      sectionTitle={copy.sectionTitle}
    />
  )
}
