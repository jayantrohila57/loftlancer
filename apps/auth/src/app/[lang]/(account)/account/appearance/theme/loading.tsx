import {
  AuthAccountAppearanceFormSkeleton,
  getAppearanceFormSectionCopy,
} from "@modules/appearance-preferences"

export default async function AuthAccountAppearanceThemeLoading() {
  const copy = await getAppearanceFormSectionCopy("theme")
  return (
    <AuthAccountAppearanceFormSkeleton
      frameDescription={copy.frameDescription}
      frameTitle={copy.frameTitle}
      section="theme"
      sectionDescription={copy.sectionDescription}
      sectionTitle={copy.sectionTitle}
    />
  )
}
