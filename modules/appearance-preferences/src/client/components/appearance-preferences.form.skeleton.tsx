import { Skeleton } from "@packages/ui/components/skeleton"
import { AppearancePreferencesFrame } from "./appearance-preferences.frame"
import type { AppearanceFormSection } from "./appearance-preferences.layout"
import { appearanceFormBodyMinHeightClass } from "./appearance-preferences.layout"
import { AppearanceFormSectionSkeleton } from "./appearance-preferences.section-skeleton"

function AppearanceFormBodySkeleton({
  section,
  sectionDescription,
  sectionTitle,
}: {
  readonly section: AppearanceFormSection
  readonly sectionDescription: string
  readonly sectionTitle: string
}) {
  const panelHeight = "aspect-[286/170]"
  return (
    <div
      aria-busy="true"
      aria-hidden="true"
      className={`flex flex-col gap-4 ${appearanceFormBodyMinHeightClass}`}
    >
      <AppearanceFormSectionSkeleton
        description={sectionDescription}
        title={sectionTitle}
      >
        <Skeleton className={`w-full rounded-lg ${panelHeight}`} />
        {section === "zoom" ? (
          <Skeleton className="mt-4 h-16 w-full rounded-lg" />
        ) : null}
      </AppearanceFormSectionSkeleton>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}

export function AuthAccountAppearanceFormSkeleton({
  frameDescription,
  frameTitle,
  section,
  sectionDescription,
  sectionTitle,
}: {
  readonly frameDescription: string
  readonly frameTitle: string
  readonly section: AppearanceFormSection
  readonly sectionDescription: string
  readonly sectionTitle: string
}) {
  return (
    <AppearancePreferencesFrame
      description={frameDescription}
      title={frameTitle}
    >
      <AppearanceFormBodySkeleton
        section={section}
        sectionDescription={sectionDescription}
        sectionTitle={sectionTitle}
      />
    </AppearancePreferencesFrame>
  )
}
