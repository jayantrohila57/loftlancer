import { LayoutDashboard } from "lucide-react"
import type {
  DefineHomeNavigationItemsInput,
  NavigationItem,
} from "../types/navigation.types"

const HOME_NAV_GROUP_ID = "home-root"

export function defineHomeNavigationItems(
  input: DefineHomeNavigationItemsInput
): readonly NavigationItem[] {
  const homeHref = input.homeHref ?? "/"
  const homeLabel = input.homeLabel ?? homeHref

  return [
    {
      description: input.homeDescription,
      groupId: HOME_NAV_GROUP_ID,
      groupLabel: input.groupLabel,
      href: homeHref,
      icon: LayoutDashboard,
      id: "home",
      label: homeLabel,
      order: 0,
      placements: ["sidebar", "command"],
      keywords: [input.groupLabel, "home", "dashboard"],
    },
  ]
}
