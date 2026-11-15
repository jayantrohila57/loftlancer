import {
  AuthAccountAppearanceFormSkeleton,
  getAppearanceFormSectionCopy,
} from "@modules/appearance-preferences"

export default async function AuthAccountAppearanceSidebarLoading() {
  const copy = await getAppearanceFormSectionCopy("sidebar")
  return (
    <AuthAccountAppearanceFormSkeleton
      frameDescription={copy.frameDescription}
      frameTitle={copy.frameTitle}
      section="sidebar"
      sectionDescription={copy.sectionDescription}
      sectionTitle={copy.sectionTitle}
    />
  )
}
