import { Skeleton } from "@packages/ui/components/skeleton"
import { RegionalPreferencesFrame } from "./regional-preferences.frame"
import {
  regionalFaqItemHeightClass,
  regionalOverviewBodyMinHeightClass,
  regionalOverviewCardHeightClass,
  regionalOverviewFaqMinHeightClass,
  regionalOverviewFormatSkeletonIds,
  regionalOverviewStatusHeightClass,
} from "./regional-preferences.layout"
import { RegionalFormSectionSkeleton } from "./regional-preferences.section-skeleton"

function RegionalOverviewCardSkeleton() {
  return (
    <Skeleton
      className={`w-full rounded-xl ${regionalOverviewCardHeightClass}`}
    />
  )
}

export function RegionalOverviewBodySkeleton({
  formatsSectionDescription,
  formatsSectionTitle,
  localeSectionDescription,
  localeSectionTitle,
}: {
  readonly formatsSectionDescription: string
  readonly formatsSectionTitle: string
  readonly localeSectionDescription: string
  readonly localeSectionTitle: string
}) {
  return (
    <div
      aria-busy="true"
      className={`flex flex-col gap-2 ${regionalOverviewBodyMinHeightClass}`}
    >
      <Skeleton
        className={`w-full max-w-xl ${regionalOverviewStatusHeightClass}`}
      />
      <RegionalFormSectionSkeleton
        description={localeSectionDescription}
        title={localeSectionTitle}
      >
        <div className="flex flex-col gap-4">
          <RegionalOverviewCardSkeleton />
          <RegionalOverviewCardSkeleton />
        </div>
      </RegionalFormSectionSkeleton>
      <RegionalFormSectionSkeleton
        description={formatsSectionDescription}
        title={formatsSectionTitle}
      >
        <div className="flex flex-col gap-4">
          {regionalOverviewFormatSkeletonIds.map((id) => (
            <RegionalOverviewCardSkeleton key={id} />
          ))}
        </div>
      </RegionalFormSectionSkeleton>
    </div>
  )
}

export function AuthAccountRegionalOverviewSkeleton({
  description,
  faqDescription,
  faqLead,
  faqTitle,
  formatsSectionDescription,
  formatsSectionTitle,
  localeSectionDescription,
  localeSectionTitle,
  title,
}: {
  readonly description: string
  readonly faqDescription: string
  readonly faqLead: string
  readonly faqTitle: string
  readonly formatsSectionDescription: string
  readonly formatsSectionTitle: string
  readonly localeSectionDescription: string
  readonly localeSectionTitle: string
  readonly title: string
}) {
  return (
    <>
      <RegionalPreferencesFrame description={description} title={title}>
        <RegionalOverviewBodySkeleton
          formatsSectionDescription={formatsSectionDescription}
          formatsSectionTitle={formatsSectionTitle}
          localeSectionDescription={localeSectionDescription}
          localeSectionTitle={localeSectionTitle}
        />
      </RegionalPreferencesFrame>
      <RegionalPreferencesFrame description={faqDescription} title={faqTitle}>
        <div
          aria-busy="true"
          className={`flex flex-col gap-3 ${regionalOverviewFaqMinHeightClass}`}
        >
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {faqLead}
          </p>
          {["saved", "default", "apps", "language", "currency"].map((id) => (
            <Skeleton
              key={id}
              className={`w-full rounded-xl ${regionalFaqItemHeightClass}`}
            />
          ))}
        </div>
      </RegionalPreferencesFrame>
    </>
  )
}
