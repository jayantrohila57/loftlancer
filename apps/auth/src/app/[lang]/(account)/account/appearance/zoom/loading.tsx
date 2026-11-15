import {
  AuthAccountAppearanceFormSkeleton,
  getAppearanceFormSectionCopy,
} from "@modules/appearance-preferences"

export default async function AuthAccountAppearanceZoomLoading() {
  const copy = await getAppearanceFormSectionCopy("zoom")
  return (
    <AuthAccountAppearanceFormSkeleton
      frameDescription={copy.frameDescription}
      frameTitle={copy.frameTitle}
      section="zoom"
      sectionDescription={copy.sectionDescription}
      sectionTitle={copy.sectionTitle}
    />
  )
}
