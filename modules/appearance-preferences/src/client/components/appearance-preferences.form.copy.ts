import type { AppearanceFormSection } from "./appearance-preferences.layout"

export type AppearanceFormSectionCopy = {
  frameDescription: string
  frameTitle: string
  sectionDescription: string
  sectionTitle: string
}

type AppearanceFormTranslator = (
  key:
    | "densityFrameDescription"
    | "densityFrameTitle"
    | "densitySectionDescription"
    | "densitySectionTitle"
    | "sidebarFrameDescription"
    | "sidebarFrameTitle"
    | "sidebarSectionDescription"
    | "sidebarSectionTitle"
    | "themeFrameDescription"
    | "themeFrameTitle"
    | "themeSectionDescription"
    | "themeSectionTitle"
    | "zoomFrameDescription"
    | "zoomFrameTitle"
    | "zoomSectionDescription"
    | "zoomSectionTitle"
) => string

export function resolveAppearanceFormSectionCopy(
  section: AppearanceFormSection,
  translateAppearance: AppearanceFormTranslator
): AppearanceFormSectionCopy {
  switch (section) {
    case "theme":
      return {
        frameTitle: translateAppearance("themeFrameTitle"),
        frameDescription: translateAppearance("themeFrameDescription"),
        sectionTitle: translateAppearance("themeSectionTitle"),
        sectionDescription: translateAppearance("themeSectionDescription"),
      }
    case "density":
      return {
        frameTitle: translateAppearance("densityFrameTitle"),
        frameDescription: translateAppearance("densityFrameDescription"),
        sectionTitle: translateAppearance("densitySectionTitle"),
        sectionDescription: translateAppearance("densitySectionDescription"),
      }
    case "sidebar":
      return {
        frameTitle: translateAppearance("sidebarFrameTitle"),
        frameDescription: translateAppearance("sidebarFrameDescription"),
        sectionTitle: translateAppearance("sidebarSectionTitle"),
        sectionDescription: translateAppearance("sidebarSectionDescription"),
      }
    case "zoom":
      return {
        frameTitle: translateAppearance("zoomFrameTitle"),
        frameDescription: translateAppearance("zoomFrameDescription"),
        sectionTitle: translateAppearance("zoomSectionTitle"),
        sectionDescription: translateAppearance("zoomSectionDescription"),
      }
  }
}
