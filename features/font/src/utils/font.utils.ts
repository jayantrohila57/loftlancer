import { cn } from "@packages/ui/lib/utils"

import { fontMono, fontSans } from "../capability/font.fonts"
import { fontRootDefaults } from "../constants/font.constants"

export function rootFontClassName() {
  return cn(
    ...fontRootDefaults.htmlExtras,
    fontRootDefaults.bodyClassName,
    fontSans.variable,
    fontMono.variable
  )
}
