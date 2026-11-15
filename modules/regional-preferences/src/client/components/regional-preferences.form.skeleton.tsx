import { Skeleton } from "@packages/ui/components/skeleton"
import { RegionalPreferencesFrame } from "./regional-preferences.frame"
import type { RegionalFormSection } from "./regional-preferences.layout"
import {
  regionalFormActionsHeightClass,
  regionalFormBodyMinHeightClass,
  regionalFormFieldHeightClass,
  regionalFormPreviewHeightClass,
  regionalMeasurementFieldHeightClass,
} from "./regional-preferences.layout"

function FormKitSectionSkeleton({
  fieldVariant = "combobox",
}: {
  readonly fieldVariant?: "combobox" | "measurement" | "segmented"
}) {
  const fieldHeight =
    fieldVariant === "measurement"
      ? regionalMeasurementFieldHeightClass
      : regionalFormFieldHeightClass

  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-28" />
      <Skeleton className={`w-full rounded-lg ${fieldHeight}`} />
    </div>
  )
}

export function RegionalFormBodySkeleton({
  section,
}: {
  readonly section: RegionalFormSection
}) {
  const bodyMin = regionalFormBodyMinHeightClass[section]

  if (section === "date-time") {
    return (
      <div
        aria-busy="true"
        aria-hidden="true"
        className={`flex flex-col gap-6 ${bodyMin}`}
      >
        <FormKitSectionSkeleton />
        <FormKitSectionSkeleton fieldVariant="segmented" />
        <FormKitSectionSkeleton fieldVariant="segmented" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton
            className={`w-full rounded-lg ${regionalFormPreviewHeightClass}`}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton
            className={`w-24 rounded-md ${regionalFormActionsHeightClass}`}
          />
          <Skeleton
            className={`w-24 rounded-md ${regionalFormActionsHeightClass}`}
          />
        </div>
      </div>
    )
  }

  const fieldVariant =
    section === "measurements"
      ? "measurement"
      : section === "numbers"
        ? "segmented"
        : "combobox"

  return (
    <div
      aria-busy="true"
      aria-hidden="true"
      className={`flex flex-col gap-6 ${bodyMin}`}
    >
      <div className="space-y-4">
        <FormKitSectionSkeleton fieldVariant={fieldVariant} />
        <Skeleton
          className={`w-full rounded-lg ${regionalFormPreviewHeightClass}`}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton
          className={`w-24 rounded-md ${regionalFormActionsHeightClass}`}
        />
        <Skeleton
          className={`w-24 rounded-md ${regionalFormActionsHeightClass}`}
        />
      </div>
    </div>
  )
}

export function AuthAccountRegionalFormSkeleton({
  description,
  section,
  title,
}: {
  readonly description: string
  readonly section: RegionalFormSection
  readonly title: string
}) {
  return (
    <RegionalPreferencesFrame description={description} title={title}>
      <RegionalFormBodySkeleton section={section} />
    </RegionalPreferencesFrame>
  )
}
