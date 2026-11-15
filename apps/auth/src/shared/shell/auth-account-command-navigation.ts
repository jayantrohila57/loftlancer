import type { NavigationItem } from "@features/navigation"
import type { AccountSidebarNavGroup, ShellTranslate } from "@modules/shell"
import {
  accountHubDestinationDescription,
  accountHubSectionDescription,
} from "@modules/shell"

/** Stable command/sidebar ids derived from route paths (`/account/profile` → `account.profile`). */
export function navigationIdFromHref(href: string): string {
  const normalized = href.replace(/^\//, "").replaceAll("/", ".")
  return normalized.length > 0 ? normalized : "root"
}

export function defineAuthAccountNavigationItems(
  groups: readonly AccountSidebarNavGroup[],
  translate: ShellTranslate
): readonly NavigationItem[] {
  const items: NavigationItem[] = []
  let order = 0

  for (const group of groups) {
    for (const navItem of group.items) {
      const parentId = navigationIdFromHref(navItem.href)
      const hasSubItems =
        navItem.subItems !== undefined && navItem.subItems.length > 0

      if (hasSubItems) {
        items.push({
          description: accountHubSectionDescription(translate, navItem.href),
          groupId: group.label,
          groupLabel: group.label,
          href: navItem.href,
          icon: navItem.icon,
          id: parentId,
          keywords: [navItem.label, group.label],
          label: navItem.label,
          order,
          placements: ["command"],
        })
        order += 1

        for (const destination of navItem.subItems ?? []) {
          const childId = navigationIdFromHref(destination.href)
          if (childId === parentId) {
            continue
          }

          const icon =
            "icon" in destination && destination.icon !== undefined
              ? destination.icon
              : navItem.icon

          items.push({
            description: accountHubDestinationDescription(
              translate,
              destination.href
            ),
            groupId: group.label,
            groupLabel: group.label,
            href: destination.href,
            icon,
            id: childId,
            keywords: [destination.label, navItem.label, group.label],
            label: destination.label,
            order,
            parentId,
            placements: ["command"],
          })
          order += 1
        }

        continue
      }

      items.push({
        description: accountHubSectionDescription(translate, navItem.href),
        groupId: group.label,
        groupLabel: group.label,
        href: navItem.href,
        icon: navItem.icon,
        id: parentId,
        keywords: [navItem.label, group.label],
        label: navItem.label,
        order,
        placements: ["command"],
      })
      order += 1
    }
  }

  return items
}
