export type RegionalFormSection =
  | "language"
  | "region"
  | "date-time"
  | "currency"
  | "numbers"
  | "measurements"

export const regionalOverviewCardHeightClass = "h-52"
export const regionalFormFieldHeightClass = "h-10"
export const regionalFormPreviewHeightClass = "h-28"
export const regionalFormActionsHeightClass = "h-9"
export const regionalFaqItemHeightClass = "h-16"
export const regionalOverviewStatusHeightClass = "h-5"
export const regionalMeasurementFieldHeightClass = "h-36"

/** Stable min-heights for loading, error, and loaded form bodies (reduces layout shift). */
export const regionalFormBodyMinHeightClass: Record<
  RegionalFormSection,
  string
> = {
  language: "min-h-[17.5rem]",
  region: "min-h-[17.5rem]",
  currency: "min-h-[17.5rem]",
  numbers: "min-h-[17.5rem]",
  measurements: "min-h-[21rem]",
  "date-time": "min-h-[26rem]",
}

export const regionalOverviewBodyMinHeightClass = "min-h-[32rem]"
export const regionalOverviewFaqMinHeightClass = "min-h-[22rem]"

export const regionalOverviewLocaleSkeletonIds = ["language", "region"] as const
export const regionalOverviewFormatSkeletonIds = [
  "date-time",
  "numbers",
  "currency",
  "measurements",
] as const
