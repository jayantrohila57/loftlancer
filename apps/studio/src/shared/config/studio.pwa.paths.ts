import { studioBasePath } from "../../../app.config"

/** Prefix asset URLs when Studio is path-mounted (`NEXT_BASE_PATH=/studio`). */
export function studioAssetPath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return studioBasePath ? `${studioBasePath}${path}` : path
}
