import { createNavigation } from "next-intl/navigation"

import type { AppRouting } from "../types/i18n.types"

export function createI18nNavigation(routing: AppRouting) {
  return createNavigation(routing)
}
