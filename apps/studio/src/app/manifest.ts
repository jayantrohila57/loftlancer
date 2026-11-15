import type { MetadataRoute } from "next"

import studioPwaManifest from "@/shared/config/studio.pwa.manifest.json"
import { studioAssetPath } from "@/shared/config/studio.pwa.paths"

export default function manifest(): MetadataRoute.Manifest {
  const icons: MetadataRoute.Manifest["icons"] = studioPwaManifest.icons.map(
    (icon) => ({
      ...icon,
      src: studioAssetPath(icon.src),
      purpose: icon.purpose as "any" | "maskable" | undefined,
    })
  )
  const screenshots: MetadataRoute.Manifest["screenshots"] =
    studioPwaManifest.screenshots?.map((shot) => ({
      ...shot,
      src: studioAssetPath(shot.src),
      form_factor: shot.form_factor as "narrow" | "wide",
    }))

  const { screenshots: _omit, display: _display, ...base } = studioPwaManifest

  return {
    ...base,
    display: studioPwaManifest.display as MetadataRoute.Manifest["display"],
    start_url: studioAssetPath(studioPwaManifest.start_url),
    scope: studioAssetPath(studioPwaManifest.scope),
    icons,
    ...(screenshots ? { screenshots } : {}),
  }
}
