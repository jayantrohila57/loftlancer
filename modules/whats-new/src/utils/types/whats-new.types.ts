export const WHATS_NEW_SECTION_HEADINGS = [
  "Added",
  "Changed",
  "Removed",
  "Breaking",
] as const

export type WhatsNewSectionHeading = (typeof WHATS_NEW_SECTION_HEADINGS)[number]

export type WhatsNewSections = Partial<
  Record<WhatsNewSectionHeading, readonly string[]>
>

export interface WhatsNewReleaseNotes {
  readonly version: string
  readonly date: string | null
  readonly sections: WhatsNewSections
}
