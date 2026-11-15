"use client"

import { cn } from "@packages/ui/lib/utils"
import type {
  AppearancePreviewId,
  AppearancePreviewSrc,
} from "../../../types/form.field.types"
import { appearancePreviewSvgs } from "./appearance-preview-svgs.generated"

/** Matches bundled appearance SVGs (286×170 viewBox, 284×168 window + stroke inset). */
export const appearancePreviewAspectClass = "aspect-[286/170]"

/** Full width of the grid column (same footprint as zoom preview tiles). */
export const appearancePreviewTileClass = "w-full"

const surfaceClass = "appearance-preview size-full [&_svg]:size-full"

export type AppearancePreviewPalette = "app" | "dark" | "light"

function AppearanceInlineSvg({
  alt,
  id,
  palette = "app",
  systemSplit = false,
}: {
  readonly alt: string
  readonly id: AppearancePreviewId
  readonly palette?: AppearancePreviewPalette
  readonly systemSplit?: boolean
}) {
  const markup = appearancePreviewSvgs[id]
  return (
    <span
      aria-label={alt}
      className={surfaceClass}
      data-appearance-palette={
        systemSplit || palette === "app" ? undefined : palette
      }
      data-appearance-preview={systemSplit ? "system" : undefined}
      role="img"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted generated SVG markup
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export function appearancePreviewFrameClass(): string {
  return cn(
    "relative block w-full overflow-hidden",
    appearancePreviewAspectClass
  )
}

export function appearancePreviewSelectableFrameClass(): string {
  return cn(
    appearancePreviewFrameClass(),
    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-64"
  )
}

export function AppearanceThemedPreview({
  alt,
  palette = "app",
  src,
}: {
  readonly alt: string
  readonly palette?: AppearancePreviewPalette
  readonly src: AppearancePreviewSrc
}) {
  if (src === "theme-system") {
    return <AppearanceInlineSvg alt={alt} id="theme-system" systemSplit />
  }
  return <AppearanceInlineSvg alt={alt} id={src} palette={palette} />
}

export function AppearancePreviewImage({
  alt,
  className,
  palette = "app",
  src,
}: {
  readonly alt: string
  readonly className?: string
  readonly palette?: AppearancePreviewPalette
  readonly src: AppearancePreviewSrc
}) {
  return (
    <span className={cn(appearancePreviewFrameClass(), className)}>
      <AppearanceThemedPreview alt={alt} palette={palette} src={src} />
    </span>
  )
}
